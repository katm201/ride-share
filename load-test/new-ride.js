const axios = require('axios');
const faker = require('faker');
const prompt = require('prompt');

require('dotenv').config();

const { uuid } = faker.random;

const url = 'http://localhost:3333/new_ride';

const createLocation = () => {
  const minLog = -122.75;
  const minLat = 36.8;
  const lat = (minLat + Math.random()).toPrecision(8);
  const log = (minLog + Math.random()).toPrecision(9);
  return `POINT(${log} ${lat})`;
};

const createRideRequest = () => ({ start_loc: createLocation(), ride_id: uuid() });

const sendNewRides = (count) => {
  const requests = [];
  for (let i = 0; i < count; i++) {
    requests.push(axios.post(url, createRideRequest()));
  }
  axios.all(requests)
    .then(axios.spread((...args) => {
      console.log('done');
    }))
    .catch((err) => {
      console.log(err);
    });
};

prompt.start();

prompt.get(['totalRides', 'toLocal'], (err, result) => {
  console.log(`Input recieved: sending ${result.totalRides} to ${result.toLocal ? 'local /new_ride' : 'deployed /new_ride'}`);
  const baseUrl = result.toLocal ? process.env.EC2_URL : `http://localhost:${process.env.PORT}`;
  sendNewRides(result.totalDrivers, `${baseUrl}/new_ride`);
});
