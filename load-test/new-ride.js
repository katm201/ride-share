const axios = require('axios');
const faker = require('faker');

const { uuid } = faker.random;

const url = 'http://localhost:3333/new_ride';

const createLocation = () => {
  const minLog = -122.75;
  const minLat = 36.8;
  const lat = (minLat + Math.random()).toPrecision(4);
  const log = (minLog + Math.random()).toPrecision(4);
  return `POINT(${log} ${lat})`;
};

const createRideRequest = () => ({ start_loc: createLocation(), ride_id: uuid() });

const sendNewRides = (count) => {

  const send = (countLeft) => {
    if (countLeft < 1) {
      return;
    } else {
      const request = createRideRequest();

      axios.post(url, request)
        .then((response) => {
          send(countLeft - 1);
        })
        .catch((err) => {
          send(countLeft - 1);
        });
    }
  };

  send(count);
}

sendNewRides(2);
