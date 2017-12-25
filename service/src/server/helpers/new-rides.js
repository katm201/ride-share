import axios from 'axios';
import dotenv from 'dotenv';
import Promise from 'bluebird';

import db from '../../database/index';

dotenv.config();

const { pgKnex, st } = db;

const getNearestDrivers = job => (
  pgKnex('drivers').select('id', st.asText('location')).orderByRaw(`ST_Distance(location, ST_GeometryFromText('${job.start_loc}', 4326)) DESC LIMIT 5`).where({ booked: false, available: true })
);

const updateDrivers = (drivers) => {
  return Promise.map(drivers, (driver) => {
    return pgKnex.transaction((tx) => {
      return tx
        .into('drivers')
        .where('id', driver.id)
        .update({ booked: true })
        .transacting(tx);
    })

  });
  // const driverUpdates = drivers.map(driver => (pgKnex('drivers').where('id', driver.id).update({ booked })));
  // return Promise.all(driverUpdates);
};

const addRequest = (rideInfo) => {
  const location = st.geomFromText(rideInfo.start_loc, 4326);
  return pgKnex('requests').insert({ ride_id: rideInfo.ride_id, start_loc: location }).returning('id');
};

const addJoins = (dispatchInfo) => {
  const joins = dispatchInfo.drivers.map(driver => (
    {
      request_id: dispatchInfo.request_id,
      driver_id: driver.driver_id,
    }
  ));
  return pgKnex.batchInsert('requests_drivers', joins, 5);
};

const sendDrivers = (options) => {
  if (process.env.IS_DEV_ENV) { return; }
  return axios.post(`${process.env.DISPATCH_URL}/dispatch`, options);
};

const newRide = (job) => {
  const dispatchInfo = {
    ride_id: job.ride_id,
    start_loc: job.start_loc,
    drivers: [],
  };
  return pgKnex.transaction((tx) => {
    return getNearestDrivers(job)
      .transacting(tx)
      .then((drivers) => {
        drivers.forEach((driver) => {
          console.log(driver);
          dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
        });
        return updateDrivers(drivers);
      })
      .then((response) => {
        console.log(response);
      });
  })
    .then(() => { console.log('it worked'); })
    .catch((err) => { console.log('error transacting', err); });
};

// const newRide = {
//   getNearestDrivers,
//   updateDrivers,
//   addRequest,
//   addJoins,
//   sendDrivers,
// };

export default newRide;
