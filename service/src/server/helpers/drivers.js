require('dotenv').config();
const newrelic = require('newrelic');

const db = require('../../database/index');

const { pgKnex, st } = db;

// helper function to format the info needed to
// insert a new driver into the database
const formatNewDriver = job => (
  {
    first_name: job.first_name,
    last_name: job.last_name,
    joined: job.joined,
    last_checkin: job.joined,
    available: true,
    booked: false,
    location: st.geomFromText(job.location, 4326),
    census_block_id: job.census_block_id,
  }
);

// helper function to format the info needed to
// update a driver's location and booked status
// after finishing a ride
const changeBooked = job => (
  {
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

// helper function to format the info needed to
// update a driver's location, booked status, and
// available for work status
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

// helper function to get the census block
// based on a location point
const getCensusBlock = (location, job) => (
  pgKnex('census_blocks')
    .select('gid')
    .whereRaw(`ST_Intersects(${st.geomFromText(location, 4326)}, geom) = ?`, [true])
    .returning('gid')
    .then((ids) => {
      if (job) {
        const info = job;
        info.census_block_id = ids[0].gid;
        return info;
      }
      return ids[0].gid;
    })
    .catch(() => {
      if (job) {
        const info = job;
        info.census_block_id = null;
        return info;
      }
      return null;
    })
);

// helper function to get the total number of drivers
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

// helper function to get the number of drivers who are
// currently booked on a ride
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

// helper function to get the number of drivers who are
// currently unavailable to work
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

module.exports = {
  formatNewDriver,
  changeBooked,
  updateStatus,
  getCensusBlock,
  getTotalCount,
  getBookedCount,
  getUnavailableCount,
};
