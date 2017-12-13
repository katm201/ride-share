import tables from '../config';
import db from '../index';

const { Driver } = tables;
const { pgKnex, st } = db;

const createLocation = () => {
  const minLat = -122.75;
  const minLog = 36.8;
  const lat = (minLat + Math.random()).toPrecision(4);
  const log = (minLog + Math.random()).toPrecision(4);
  return `POINT(${lat} ${log})`;
};

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
  const info = {
    name: driver.name,
    joined: new Date().toISOString(),
    last_checkin: new Date().toISOString(),
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
