/* eslint-disable */

const expect = require('chai').expect;
const axios = require('axios');
const faker = require('faker');

const { uuid } = faker.random;

require('dotenv').config();

const port = process.env.PORT || 80;

const baseUrl = `http://localhost:${port}`;

describe('GET /', () => {
  it('responds with a status code of 200', (done) => {
    axios.get(`${baseUrl}/`)
      .then((response) => {
        expect(response.status).to.equal(200);
        done();
      })
      .catch((err) => {
        console.log('There was an error requesting / from the server', err);
      })
  })
});

describe('POST /new_ride', () => {
  const createLocation = () => {
    const minLog = -122.75;
    const minLat = 36.8;
    const lat = (minLat + Math.random()).toPrecision(8);
    const log = (minLog + Math.random()).toPrecision(9);
    return `POINT(${log} ${lat})`;
  };

  const createRideRequest = () => ({ start_loc: createLocation(), ride_id: uuid() });

  it('responds with a status code of 201', (done) => {
    axios.post(`${baseUrl}/new_ride`, createRideRequest())
      .then((response) => {
        expect(response.status).to.equal(201);
        done();
      })
      .catch((err) => {
        console.log('There was an error POSTing /new_ride to the server', err);
      })
  })
});

/* eslint-enable */
