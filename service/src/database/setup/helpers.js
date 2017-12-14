/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
import faker from 'faker';

import db from '../index';

const { firstName, lastName } = faker.name;

const { st } = db;

const createLocation = () => {
  const minLog = -122.75;
  const minLat = 36.8;
  const lat = (minLat + Math.random()).toPrecision(4);
  const log = (minLog + Math.random()).toPrecision(4);
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

const createRequests = (count) => {
  const requests = [];

  for (let i = 0; i < count; i++) {
    const location = createLocation();

    const info = {
      start_loc: st.geomFromText(location, 4326),
    };

    requests.push(info);
  }

  return requests;
};

const helpers = {
  createTime,
  createLocation,
  createDrivers,
  createRequests,
};

export default helpers;
