require('dotenv').config();
const newrelic = require('newrelic');
const axios = require('axios');
const Promise = require('bluebird');

const { pgKnex, st } = require('../../database/index');
const { getCensusBlock } = require('./drivers');

const getNearestDrivers = (job, gid, tx) => (
  newrelic.startBackgroundTransaction('new-rides/knex/nearest-drivers', 'db', () => (
    pgKnex.into('drivers')
      .select('id', st.asText('location'))
      .orderByRaw(`ST_Distance(location, ${st.geomFromText(job.start_loc, 4326)}) LIMIT 5`)
      .where({ booked: false, available: true, census_block_id: gid })
      .transacting(tx)
      .then((drivers) => {
        newrelic.endTransaction();
        return drivers;
      })
  ))
);

const updateDrivers = drivers => (
  Promise.map(drivers, driver => (
    newrelic.startBackgroundTransaction('new-rides/knex/update-driver', 'db', () => (
      pgKnex.transaction(tx => (
        tx.into('drivers')
          .where('id', driver.id)
          .update({ booked: true })
          .transacting(tx)
          .then(() => (newrelic.endTransaction()))
      ))
    ))
  ))
);

const addRequest = (rideInfo, tx) => {
  const location = st.geomFromText(rideInfo.start_loc, 4326);
  return newrelic.startBackgroundTransaction('new-rides/knex/add-request', 'db', () => (
    tx.into('requests')
      .insert({ ride_id: rideInfo.ride_id, start_loc: location, census_block_id: rideInfo.gid })
      .returning('id')
      .then((ids) => {
        newrelic.endTransaction();
        return ids[0];
      })
  ));
};

const addJoins = (dispatchInfo, tx) => {
  const joins = dispatchInfo.drivers.map(driver => (
    {
      request_id: dispatchInfo.request_id,
      driver_id: driver.driver_id,
    }
  ));
  return newrelic.startBackgroundTransaction('new-rides/knex/add-joins', 'db', () => (
    tx.batchInsert('requests_drivers', joins, 5)
      .then(() => (newrelic.endTransaction()))
  ));
};

const sendDrivers = (options) => {
  if (process.env.IS_DEV_ENV) { return; }
  return newrelic.startBackgroundTransaction('new-rides/knex/send-drivers', 'axios', () => {
    return axios.post(`${process.env.DISPATCH_URL}/dispatch`, options)
      .then(() => (newrelic.endTransaction()));
  });
};

const newRide = (job) => {
  const dispatchInfo = {
    ride_id: job.ride_id,
    start_loc: job.start_loc,
    drivers: [],
  };
  return pgKnex.transaction(tx => (
    newrelic.startBackgroundTransaction('new-rides/knex/census-block', 'db', () => (
      getCensusBlock(job.start_loc)
        .then((gid) => {
          newrelic.endTransaction();
          const newJob = job;
          newJob.gid = gid;
          return getNearestDrivers(job, gid, tx);
        })
        .then((drivers) => {
          drivers.forEach((driver) => {
            dispatchInfo.drivers.push({ driver_id: driver.id, driver_loc: driver.location });
          });
          return updateDrivers(drivers);
        })
        .then(() => (sendDrivers(dispatchInfo)))
        .then(() => (addRequest(job, tx)))
        .then((id) => {
          const join = {
            request_id: id,
            drivers: dispatchInfo.drivers,
          };
          return addJoins(join, tx);
        })
        .catch((err) => {
          console.log(err);
        })
    ))
  ));
};

module.exports = {
  newRide,
  sendDrivers,
  addJoins,
  addRequest,
  getNearestDrivers,
  updateDrivers,
};
