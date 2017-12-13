/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

import faker from 'faker';

import tables from '../config';
import db from '../index';
import helpers from './helpers';

const { firstName, lastName } = faker.name;

const { Driver } = tables;
const { pgKnex, st } = db;

const { createLocation, createTime } = helpers;

const drivers = [];

for (let i = 0; i < 100; i++) {
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
  drivers.push(Driver.forge(info).save());
}

Promise.all(drivers).then(() => {
  console.log('drivers saved');
  pgKnex.destroy();
}).catch((err) => {
  console.log(err);
  pgKnex.destroy();
});
