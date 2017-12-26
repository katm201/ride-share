/* eslint-disable */

const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const faker = require('faker');

const queue = require('../service/build/server/helpers/process-queue');

const { uuid } = faker.random;

// const { processDrivers } = queue;
// console.log(queue);

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

xdescribe('Process new-driver job queue', () => {
  const jobType = 'new';
  const job = {
    first_name: 'Bobby',
    last_name: 'Tester',
    joined: '2017-01-11T00:20:21.730Z',
    location: 'POINT(-121.905535 37.586335)',
  };

  it('calls the model[jobType] function', (done) => {

    done();
  });
});

xdescribe('Process update-driver job queue', () => {
  const jobType = 'complete';
  const job = {
    driver_id: 1,
    location: 'POINT(-121.905535 37.586335)',
  };
  
  it('process complete-driver', (done) => {
    done();
  });
});

xdescribe('Process update-driver job queue', () => {
  const jobType = 'update';
  const job = {
    driver_id: 1,
    available: false,
    location: 'POINT(-121.905535 37.586335)',
  };

  it('process update-driver', (done) => {
    done();
  });
});

xdescribe('Process ride job queue', () => {
  it('process new-ride', (done) => {
    const jobType = 'new-ride';
    done();
  });
});

/* eslint-enable */
