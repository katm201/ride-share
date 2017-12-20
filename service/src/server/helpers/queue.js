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
    newrelic.startBackgroundTransaction('kue-new-ride', 'kue', () => {
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
            newrelic.endTransaction();
            done();
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
  ),
  newDrivers: () => {
    newrelic.startBackgroundTransaction('kue-add-driver', 'kue', () => {
      service.queue.process('new-driver', (job, done) => {
        newDriver(job.data).save()
          .then(() => {
            console.log();
            done();
            newrelic.endTransaction();
          })
          .catch((err) => {
            console.log('error', err);
            newrelic.endTransaction();
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
