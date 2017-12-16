import axios from 'axios';
import dotenv from 'dotenv';

import db from '../../database/index';
import service from '../index';

dotenv.config();

const { pgKnex, st } = db;

const getNearestDrivers = job => (
  pgKnex('drivers').select('id', st.asText('location')).orderByRaw(`ST_Distance(location, ST_GeometryFromText('${job.start_loc}', 4326)) DESC LIMIT 5`).where({ booked: false, available: true })
);

const updateDrivers = (drivers) => {
  const driverUpdates = drivers.map(driver => (pgKnex('drivers').where('id', driver.id).update({ booked: true })));
  return Promise.all(driverUpdates);
};

const addRequest = (rideInfo) => {
  const location = st.geomFromText(rideInfo.start_loc, 4326);
  return pgKnex('requests').insert({ ride_id: rideInfo.ride_id, start_loc: location });
};

const sendDrivers = (options) => {
  if (process.env.IS_DEV_ENV) { return; }
  return axios.post(`${process.env.DISPATCH_URL}/dispatch`, options);
};

const processQueue = {
  rides: () => {
    return service.queue.process('ride', 1, (job, done) => {
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
        .then(() => {
          done();
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
};

const checkQueue = () => {
  processQueue.rides();
};

const helpers = {
  checkQueue,
};

export default helpers;
