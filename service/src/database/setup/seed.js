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

const driversInfo = createDrivers(1000000);

pgKnex.batchInsert('drivers', driversInfo)
  .returning('id')
  .then((ids) => {
    console.log(`${ids.length} drivers saved`);
    pgKnex.destroy();
  }).catch((err) => {
    console.log(err);
    pgKnex.destroy();
  });

