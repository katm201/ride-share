import dotenv from 'dotenv';
import newrelic from 'newrelic';
import kue from 'kue';

import service from '../index';
import newRide from './new-rides';
import driverUtils from './drivers';
import tables from '../../database/config';

dotenv.config();

// const {
//   getNearestDrivers,
//   updateDrivers,
//   addRequest,
//   addJoins,
//   sendDrivers,
// } = newRide;

const { Driver } = tables;

const { formatNewDriver, changeBooked, updateStatus } = driverUtils;

const processRides = () => {
  // console.log(job);
  service.queue.process('ride', 1, (job, done) => {
    // console.log(job.data);
    newRide(job.data)
      .then(() => {
        console.log('done');
        done();
      });
    // done();
  });
//   const dispatchInfo = {
//     ride_id: job.ride_id,
//     start_loc: job.start_loc,
//     drivers: [],
//   };
//   getNearestDrivers(job)
//     .then((drivers) => {
//       // console.log(new Date().toISOString());
//       // console.log(drivers);
//       drivers.forEach((driver) => {
//         // console.log(driver);
//         dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
//       });
//       // console.log(dispatchInfo);
//       return updateDrivers(drivers, true);
//     })
//     .then((response) => {
//       console.log(response);
//       return sendDrivers(dispatchInfo);
//     })
//     .then(() => {
//       return addRequest(job);
//     })
//     .then((ids) => {
//       // console.log(ids);
//       const join = {
//         request_id: ids[0],
//         drivers: dispatchInfo.drivers,
//       };
//       return addJoins(join);
//     })
//     .then(() => {
//       callback();
//     })
//     .catch((err) => { console.log(err); });
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

const processDrivers = (job, jobType, callback) => {
  return newrelic.startBackgroundTransaction(`${jobType}-driver/bookshelf/query`, 'db', () => {
    const info = formatDriver[jobType](job);
    const id = job.driver_id;
    model[jobType](info, id)
      .then(() => {
        newrelic.endTransaction();
        callback();
      })
      .catch((err) => {
        console.log('error', err);
      });
  });
};

const queue = {
  processDrivers,
  processRides,
};

export default queue;
