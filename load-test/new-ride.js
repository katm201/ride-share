const axios = require('axios');
const faker = require('faker');
const prompt = require('prompt');

require('dotenv').config();

const { uuid } = faker.random;

const createLocation = () => {
  const minLog = -122.75;
  const minLat = 36.8;
  const lat = (minLat + Math.random()).toPrecision(8);
  const log = (minLog + Math.random()).toPrecision(9);
  return `POINT(${log} ${lat})`;
};

const createRideRequest = () => ({ start_loc: createLocation(), ride_id: uuid() });

const sendNewRides = (count, url) => {
  for (let i = 0; i < count; i++) {
    const request = createRideRequest();
    axios.post(url, request)
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  }
};

// prompt.start();

// prompt.get(['totalRides', 'toLocal'], (err, result) => {
//   console.log(`Input recieved: sending ${result.totalRides} to ${result.toLocal === 'true' ? 'local /new_ride' : 'deployed /new_ride'}`);
//   const baseUrl = result.toLocal === 'true' ? `http://localhost:${process.env.PORT}` : process.env.EC2_URL;
//   return sendNewRides(result.totalDrivers, `${baseUrl}/new_ride`);
// });

const localUrl = 'http://localhost:3333/new_ride';
const deployedUrl = `${process.env.EC2_URL}/new_ride`;

sendNewRides(1, deployedUrl);
