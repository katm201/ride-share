import dotenv from 'dotenv';
import newrelic from 'newrelic';
import kue from 'kue';

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
  service.queue.active((err, ids) => {
    console.log('active', ids.length);
    // ids.forEach((id) => {
    //   kue.Job.get(id, (err, job) => {
    //     job.remove();
    //   })
    // })
  });
  // service.queue.inactive((err, ids) => { console.log('inactive', ids.length); });
  // service.queue.process('ride', 1, (job, done) => { done(); });
  // service.queue.process('ride', 1, (job, done) => {
  //   console.log('+++++', job.data);
  //   const dispatchInfo = {
  //     ride_id: job.data.ride_id,
  //     start_loc: job.data.start_loc,
  //     drivers: [],
  //   };
  //   getNearestDrivers(job.data)
  //     .then((drivers) => {
  //       // console.log(new Date().toISOString());
  //       // console.log(drivers);
  //       drivers.forEach((driver) => {
  //         dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
  //       });
  //       // console.log(dispatchInfo);
  //       return updateDrivers(drivers, true);
  //     })
  //     .then(() => {
  //       return sendDrivers(dispatchInfo);
  //     })
  //     .then(() => {
  //       return addRequest(job.data);
  //     })
  //     .then((ids) => {
  //       const join = {
  //         request_id: ids[0],
  //         drivers: dispatchInfo.drivers,
  //       };
  //       return addJoins(join);
  //     })
  //     .then(() => {
  //       done();
  //     })
  //     .catch((err) => { console.log(err); });
  // });
};

const model = {
  new: info => (Driver.forge(info).save()),
  complete: (info, id) => (Driver.forge({ id }).save(info, { patch: true })),
  update: (info, id) => (Driver.forge({ id }).save(info, { patch: true })),
};

// TODO: completeDriver should also come with a timestamp (needs to be added)
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
