import tables from '../config';
import db from '../index';

const { Driver } = tables;
const { pgKnex, st } = db;

const drivers = [
  {
    name: 'Jake', available: true, booked: false, location: 'POINT(-122.7 36.9)',
  },
  {
    name: 'Joe', available: true, booked: false, location: 'POINT(-122.7 36.9)',
  },
];

const savedDrivers = drivers.map((driver) => {
  const info = {
    name: driver.name,
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
