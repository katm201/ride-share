/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const faker = require('faker');
const db = require('../index');

const { firstName, lastName } = faker.name;
const { uuid } = faker.random;

const { pgKnex, st } = db;

// helper functions for seeding scripts


// SF Bounds (approx):
// -122.512539,37.709636,-122.387999,37.808029
// creates a random location within SF
const createLocation = () => {
  const minLog = -122.512539;
  const minLat = 37.709636;
  const lat = (minLat + (Math.random() / 8)).toPrecision(8);
  const log = (minLog + (Math.random() / 10)).toPrecision(9);
  return `POINT(${log} ${lat})`;
};

// creates a random time between 01/01/17-3/31/17
const createTime = (start = 1483257600000) => {
  const lastMs = 1491030000000;
  const addTime = Math.floor(Math.random() * (lastMs - start));
  return new Date(start + addTime);
};

// creates a fake driver
const createDrivers = (count, callback, drivers = []) => {
  if (count < 1) {
    callback(drivers);
  } else {
    const createdAt = createTime();
    const updatedAt = createTime(createdAt.getTime());
    const location = createLocation();

    const available = Math.random() > 0.5;
    const booked = available ? Math.random() > 0.5 : false;

    const info = {
      first_name: firstName(),
      last_name: lastName(),
      joined: createdAt.toISOString(),
      last_checkin: updatedAt.toISOString(),
      available,
      booked,
      location: st.geomFromText(location, 4326),
    };

    // gets the census block attached to the random location
    // point above
    pgKnex('census_blocks')
      .select('gid')
      .whereRaw(`ST_Intersects(${info.location}, geom) = ?`, [true])
      .returning('gid')
      .then((ids) => {
        info.census_block_id = ids[0].gid;
        createDrivers(count - 1, callback, drivers.concat([info]));
      })
      .catch(() => {
        info.census_block_id = null;
        drivers.push(info);
        createDrivers(count - 1, callback, drivers.concat([info]));
      });
  }
};

// generates fake requests
const createRequests = (end) => {
  const requests = [];

  for (let i = 0; i < end; i++) {
    const location = createLocation();

    const info = {
      ride_id: uuid(),
      start_loc: st.geomFromText(location, 4326),
      census_block_id: Math.floor((Math.random() * 196) + 1),
    };

    requests.push(info);
  }

  return requests;
};

// generates fake join table entries
const createJoins = (start, end, driversCount) => {
  const joins = [];

  for (let i = start + 1; i <= end; i++) {
    for (let j = 0; j < 5; j++) {
      const driver = Math.floor((Math.random() * driversCount) + 1);

      const info = {
        request_id: i,
        driver_id: driver,
      };

      joins.push(info);
    }
  }

  return joins;
};

module.exports = {
  createTime,
  createLocation,
  createDrivers,
  createRequests,
  createJoins,
};
