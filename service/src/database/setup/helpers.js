/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const faker = require('faker');
const db = require('../index');

const { firstName, lastName } = faker.name;
const { uuid } = faker.random;

const { st } = db;

// -122.512539,37.709636,-122.387999,37.808029

const createLocation = () => {
  const minLog = -122.512539;
  const minLat = 37.709636;
  const lat = (minLat + (Math.random() / 8)).toPrecision(8);
  const log = (minLog + (Math.random() / 10)).toPrecision(9);
  return `POINT(${log} ${lat})`;
};

const createTime = (start = 1483257600000) => {
  const lastMs = 1491030000000;
  const addTime = Math.floor(Math.random() * (lastMs - start));
  return new Date(start + addTime);
};

const createDrivers = (count) => {
  const drivers = [];

  for (let i = 0; i < count; i++) {
    const createdAt = createTime();
    const updatedAt = createTime(createdAt.getTime());
    const location = createLocation();

    const info = {
      first_name: firstName(),
      last_name: lastName(),
      joined: createdAt.toISOString(),
      last_checkin: updatedAt.toISOString(),
      available: true,
      booked: false,
      location: st.geomFromText(location, 4326),
    };
    drivers.push(info);
  }

  return drivers;
};

const createRequests = (end) => {
  const requests = [];

  for (let i = 0; i < end; i++) {
    const location = createLocation();

    const info = {
      ride_id: uuid(),
      start_loc: st.geomFromText(location, 4326),
    };

    requests.push(info);
  }

  return requests;
};

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
