import dotenv from 'dotenv';

import service from '../index';
import newRide from './new-rides';

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
    service.queue.process('ride', 1, (job, done) => {
      const dispatchInfo = {
        ride_id: job.data.ride_id,
        start_loc: job.data.start_loc,
        drivers: [],
      };
      getNearestDrivers(job.data)
        .then((drivers) => {
          drivers.forEach((driver) => {
            dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
          });
          return updateDrivers(drivers);
        })
        .then(() => (sendDrivers(dispatchInfo)))
        .then(() => (addRequest(job.data)))
        .then(ids => (addJoins({ request_id: ids[0], drivers: dispatchInfo.drivers })))
        .then(() => {
          done();
        })
        .catch((err) => {
          console.log(err);
        });
    })
  ),
};

const checkQueue = () => {
  processQueue.rides();
};

export default checkQueue;