import tables from '../config';
import db from '../index';
import helpers from './helpers';

const { Driver } = tables;
const { pgKnex, st } = db;

const { createLocation, createTime } = helpers;

const drivers = [
  {
    name: 'Jake',
    available: true,
    booked: false,
    location: createLocation(),
  },
  {
    name: 'Joe',
    available: true,
    booked: false,
    location: createLocation(),
  },
];

const savedDrivers = drivers.map((driver) => {
  const createdAt = createTime();
  const updatedAt = createTime(createdAt.getTime());

  const info = {
    name: driver.name,
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
