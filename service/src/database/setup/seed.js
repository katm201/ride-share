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

for (let i = 0; i < 1000; i++) {
  drivers.push({
    firstName: firstName(),
    lastName: lastName(),
    available: true,
    booked: false,
    location: createLocation(),
  });
}

const savedDrivers = drivers.map((driver) => {
  const createdAt = createTime();
  const updatedAt = createTime(createdAt.getTime());

  const info = {
    first_name: driver.firstName,
    last_name: driver.lastName,
    joined: createdAt.toISOString(),
    last_checkin: updatedAt.toISOString(),
    available: driver.available,
    booked: driver.booked,
    location: st.geomFromText(driver.location, 4326),
  };
  return Driver.forge(info).save();
});

Promise.all(savedDrivers).then(() => {
  console.log('drivers saved');
  pgKnex.destroy();
}).catch((err) => {
  console.log(err);
  pgKnex.destroy();
});
