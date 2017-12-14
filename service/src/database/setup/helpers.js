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

const createRequests = (end) => {
  const requests = [];

  for (let i = 0; i < end; i++) {
    const location = createLocation();

    const info = {
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

const helpers = {
  createTime,
  createLocation,
  createDrivers,
  createRequests,
  createJoins,
};

export default helpers;
