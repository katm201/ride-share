import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';
import newRide from './new-rides';
import newDriver from './new-driver';

dotenv.config();

const {
  getNearestDrivers,
  updateDrivers,
  addRequest,
  addJoins,
  sendDrivers,
} = newRide;

const processQueue = {
  rides: () => (
    newrelic.startBackgroundTransaction('new-ride/kue/process', 'kue', () => {
      service.queue.process('ride', 1, (job, done) => {
        const dispatchInfo = {
          ride_id: job.data.ride_id,
          start_loc: job.data.start_loc,
          drivers: [],
        };
        newrelic.endTransaction();
        newrelic.startBackgroundTransaction('new-ride/knex/get-drivers', 'knex', () => {
          getNearestDrivers(job.data)
            .then((drivers) => {
              newrelic.endTransaction();
              drivers.forEach((driver) => {
                dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
              });
              newrelic.startBackgroundTransaction('new-ride/knex/update-drivers', 'knex', () => {
                updateDrivers(drivers)
                  .then(() => {
                    newrelic.endTransaction();
                    return sendDrivers(dispatchInfo);
                  })
                  .then(() => {
                    newrelic.startBackgroundTransaction('new-ride/knex/add-request', 'knex', () => {
                      addRequest(job.data)
                        .then((ids) => {
                          newrelic.endTransaction();
                          newrelic.startBackgroundTransaction('new-ride/knex/add-joins', 'knex', () => {
                            const join = {
                              request_id: ids[0],
                              drivers: dispatchInfo.drivers,
                            };
                            addJoins(join)
                              .then(() => {
                                newrelic.endTransaction();
                                done();
                              });
                          });
                        });
                    });
                  });
              });
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    })
  ),
  newDrivers: () => {
    newrelic.startBackgroundTransaction('new-driver/kue/process', 'kue', () => {
      service.queue.process('new-driver', (job, done) => {
        newrelic.endTransaction();
        newrelic.startBackgroundTransaction('new-driver/knex/add-driver', 'knex', () => {
          newDriver(job.data).save()
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
  },
};

const checkQueue = () => {
  processQueue.rides();
  processQueue.newDrivers();
};

export default checkQueue;
