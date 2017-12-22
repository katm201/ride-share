import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';
import newRide from './new-rides';
import driverUtils from './drivers';
import tables from '../../database/config';

dotenv.config();

const {
  getNearestDrivers,
  updateDrivers,
  addRequest,
  addJoins,
  sendDrivers,
} = newRide;

const { Driver } = tables;

const { formatNewDriver, changeBooked, updateStatus } = driverUtils;

const processRides = () => {
  newrelic.startBackgroundTransaction('new-ride/kue/process', 'kue', () => {
    service.queue.process('ride', 1, (job, done) => {
      const dispatchInfo = {
        ride_id: job.data.ride_id,
        start_loc: job.data.start_loc,
        drivers: [],
      };
      newrelic.endTransaction();
      newrelic.startBackgroundTransaction('new-ride/knex/get-drivers', 'db', () => {
        getNearestDrivers(job.data)
          .then((drivers) => {
            newrelic.endTransaction();
            drivers.forEach((driver) => {
              dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
            });
            newrelic.startBackgroundTransaction('new-ride/knex/update-drivers', 'db', () => {
              updateDrivers(drivers, true)
                .then(() => {
                  newrelic.endTransaction();
                  return sendDrivers(dispatchInfo);
                })
                .then(() => {
                  newrelic.startBackgroundTransaction('new-ride/knex/add-request', 'db', () => {
                    addRequest(job.data)
                      .then((ids) => {
                        newrelic.endTransaction();
                        newrelic.startBackgroundTransaction('new-ride/knex/add-joins', 'db', () => {
                          const join = {
                            request_id: ids[0],
                            drivers: dispatchInfo.drivers,
                          };
                          addJoins(join)
                            .then(() => {
                              newrelic.endTransaction();
                              done();
                            })
                            .catch((err) => { console.log(err); });
                        });
                      })
                      .catch((err) => { console.log(err); });
                  });
                })
                .catch((err) => { console.log(err); });
            });
          })
          .catch((err) => { console.log(err); });
      });
    });
  });
};

const model = {
  new: info => (Driver.forge(info).save()),
  complete: (info, id) => (Driver.forge({ id }).save(info, { patch: true })),
  update: (info, id) => (Driver.forge({ id }).save(info, { patch: true })),
};

const formatDriver = {
  new: formatNewDriver,
  complete: changeBooked,
  update: updateStatus,
};

const processDrivers = (jobType) => {
  newrelic.startBackgroundTransaction(`${jobType}-driver/kue/process`, 'kue', () => {
    service.queue.process(`${jobType}-driver`, (job, done) => {
      newrelic.endTransaction();
      newrelic.startBackgroundTransaction(`${jobType}-driver/bookshelf/query`, 'db', () => {
        const info = formatDriver[jobType](job.data);
        const id = job.data.driver_id;
        model[jobType](info, id)
          .then(() => {
            newrelic.endTransaction();
            done();
          })
          .catch((err) => {
            console.log('error', err);
          });
      });
    });
  });
};

const checkQueue = () => {
  processRides();
  processDrivers('new');
  processDrivers('complete');
  processDrivers('update');
};

export default checkQueue;
