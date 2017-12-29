require('dotenv').config();

const axios = require('axios');
const { uuid } = require('faker').random;
const prompt = require('prompt');

const { createLocation } = require('../service/src/database/setup/helpers');

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

prompt.start();

prompt.get(['totalRides', 'toLocal'], (err, result) => {
  console.log(`Input recieved: sending ${result.totalRides} to ${result.toLocal === 'true' ? 'local /new_ride' : 'deployed /new_ride'}`);
  const baseUrl = result.toLocal === 'true' ? `http://localhost:${process.env.PORT}` : process.env.EC2_URL;
  sendNewRides(result.totalRides, `${baseUrl}/new_ride`);
});
