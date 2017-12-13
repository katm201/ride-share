import tables from '../config';
import db from '../index';

const { Driver } = tables;
const { pgKnex } = db;

const drivers = [
  { name: 'Jake', available: true, booked: false },
  { name: 'Joe', available: true, booked: false },
];

const savedDrivers = drivers.map(driver => (Driver.forge(driver).save()));

Promise.all(savedDrivers).then(() => {
  console.log('drivers saved');
  pgKnex.destroy();
});
