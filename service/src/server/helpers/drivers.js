require('dotenv').config();
const newrelic = require('newrelic');

const db = require('../../database/index');

const { pgKnex, st } = db;

const formatNewDriver = job => (
  {
    first_name: job.first_name,
    last_name: job.last_name,
    joined: job.joined,
    last_checkin: job.joined,
    available: true,
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

const changeBooked = job => (
  {
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

const updateStatus = (job) => {
  const base = {
    available: job.available,
    location: st.geomFromText(job.location, 4326),
  };
  if (!job.available) {
    base.booked = false;
  }
  return base;
};

const getCensusBlock = location => (
  pgKnex('census_blocks')
    .select('gid')
    .whereRaw(`ST_Intersects(${st.geomFromText(location, 4326)}, geom) = ?`, [true])
    .returning('gid')
    .then(ids => (ids[0].gid))
    .catch(() => (null))
);

const getTotalCount = () => (
  newrelic.startBackgroundTransaction('driver-util/knex/total', 'db', () => (
    pgKnex('drivers').count('id')
      .then((totalDrivers) => {
        newrelic.endTransaction();
        return parseInt(totalDrivers[0].count, 10);
      })
      .catch((err) => { console.log(err); })
  ))
);

const getBookedCount = () => (
  newrelic.startBackgroundTransaction('driver-util/knex/booked', 'db', () => (
    pgKnex('drivers')
      .count('id')
      .where({ booked: true })
      .then((bookedDrivers) => {
        newrelic.endTransaction();
        return parseInt(bookedDrivers[0].count, 10);
      })
      .catch((err) => { console.log(err); })
  ))
);

const getUnavailableCount = () => (
  newrelic.startBackgroundTransaction('driver-util/knex/unavailable', 'db', () => (
    pgKnex('drivers')
      .count('id')
      .where({ available: false })
      .then((unavailableDrivers) => {
        newrelic.endTransaction();
        return parseInt(unavailableDrivers[0].count, 10);
      })
      .catch((err) => { console.log(err); })
  ))
);

const getUtilization = (callback) => {
  const utilization = {};
  getTotalCount()
    .then((totalDrivers) => {
      utilization.total = totalDrivers;
      return getBookedCount();
    })
    .then((bookedDrivers) => {
      utilization.booked = bookedDrivers;
      return getUnavailableCount();
    })
    .then((unavailableDrivers) => {
      utilization.unavailable = unavailableDrivers;
      callback(utilization);
    });
};

module.exports = {
  formatNewDriver,
  changeBooked,
  updateStatus,
  getUtilization,
  getCensusBlock,
};
