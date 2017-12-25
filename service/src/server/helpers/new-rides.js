import axios from 'axios';
import dotenv from 'dotenv';
import Promise from 'bluebird';

import db from '../../database/index';

dotenv.config();

const { pgKnex, st } = db;

const getNearestDrivers = job => (
  pgKnex('drivers')
    .select('id', st.asText('location'))
    .orderByRaw(`ST_Distance(location, ST_GeometryFromText('${job.start_loc}', 4326)) DESC LIMIT 5`)
    .where({ booked: false, available: true })
);

const updateDrivers = (drivers) => {
  return Promise.map(drivers, (driver) => {
    return pgKnex.transaction((tx) => {
      return tx
        .into('drivers')
        .where('id', driver.id)
        .update({ booked: true })
        .transacting(tx);
    });
  });
};

const addRequest = (rideInfo, tx) => {
  const location = st.geomFromText(rideInfo.start_loc, 4326);
  return tx
    .into('requests')
    .insert({ ride_id: rideInfo.ride_id, start_loc: location })
    .returning('id');
};

const addJoins = (dispatchInfo, tx) => {
  const joins = dispatchInfo.drivers.map(driver => (
    {
      request_id: dispatchInfo.request_id,
      driver_id: driver.driver_id,
    }
  ));
  return tx.batchInsert('requests_drivers', joins, 5);
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
          dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
        });
        return updateDrivers(drivers);
      })
      .then((response) => {
        return sendDrivers(dispatchInfo);
      })
      .then(() => {
        return addRequest(job, tx);
      })
      .then((ids) => {
        console.log(ids);
        const join = {
          request_id: ids[0],
          drivers: dispatchInfo.drivers,
        };
        return addJoins(join, tx);
      })
      .catch((err) => {
        console.log(err);
      });
  })
    .catch((err) => { console.log('error transacting', err); });
};

export default newRide;
