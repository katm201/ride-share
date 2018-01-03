require('dotenv').config();

const axios = require('axios');
const { uuid } = require('faker').random;
const prompt = require('prompt');

const { createLocation } = require('../../service/src/database/setup/helpers');

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

const sendRides = (rps, numSecondsLeft, url) => {
  if (numSecondsLeft > 0) {
    sendNewRides(rps, url);
    setTimeout(() => {
      sendRides(rps, numSecondsLeft - 1, url);
    }, 950);
  }
};

prompt.start();

prompt.get(['rps', 'numSeconds', 'toLocal'], (err, result) => {
  console.log(`Input recieved: sending ${result.rps} requests per second over ${result.numSeconds} seconds to ${result.toLocal === 'true' ? 'local /new_ride' : 'deployed /new_ride'}`);
  const baseUrl = result.toLocal === 'true' ? `http://localhost:${process.env.PORT}` : process.env.EC2_URL;
  sendRides(result.rps, result.numSeconds, `${baseUrl}/new_ride`);
});
