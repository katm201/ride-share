/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

import faker from 'faker';

import db from '../index';
import helpers from './helpers';

const { firstName, lastName } = faker.name;

const { pgKnex, st } = db;

const { createLocation, createTime } = helpers;

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

const start = new Date();
console.log('start: ', start.toISOString());
const driversInfo = createDrivers(10000);
const requestsInfo = createRequests(10000);

pgKnex.batchInsert('drivers', driversInfo, 1000)
  .returning('id')
  .then((ids) => {
    console.log(`${ids.length} drivers saved`);
    return pgKnex.batchInsert('requests', requestsInfo, 1000).returning('id');
  })
  .then((ids) => {
    const stop = new Date();
    console.log(`${ids.length} requests saved`);
    console.log('stop: ', stop.toISOString());
    pgKnex.destroy();
  })
  .catch((err) => {
    console.log(err);
    pgKnex.destroy();
  });

