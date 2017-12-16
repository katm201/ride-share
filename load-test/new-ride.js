const axios = require('axios');
const faker = require('faker');

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
  if (count < 1) {
    return;
  } else {
    const request = createRideRequest();

    axios.post(url, request)
      .then((response) => {
        sendNewRides(count - 1);
      })
      .catch((err) => {
        sendNewRides(count - 1);
      });
  }
}

sendNewRides(30);
