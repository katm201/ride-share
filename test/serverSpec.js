/* eslint-disable */
require('dotenv').config();

const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const faker = require('faker');

const { pgKnex, st } = require('../service/src/database/index.js');
const { processDrivers, formatDriver, model } = require('../service/src/server/helpers/process-queue');

const { uuid } = faker.random;

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

describe('Process new-driver job queue', () => {
  const jobType = 'new';
  const job = {
    first_name: 'Bobby',
    last_name: 'Tester',
    joined: '2017-01-11T00:20:21.730Z',
    location: 'POINT(-121.905535 37.586335)',
  };

  after((done) => {
    pgKnex('drivers')
      .where('last_name', 'Tester')
      .del()
      .then(() => {
        done();
      });
  });

  it('calls the formatDriver.new function', (done) => {
    const formatSpy = sinon.spy(formatDriver, 'new');
    
    processDrivers(job, jobType, () => {
      expect(formatSpy.callCount).to.equal(1);
      formatSpy.restore();
      done();
    });
  });

  it('gets an object from the formatDriver.new function', (done) => {
    const formatSpy = sinon.spy(formatDriver, 'new');
    const info = {
      first_name: job.first_name,
      last_name: job.last_name,
      joined: job.joined,
      available: true,
      booked: false,
      location: st.geomFromText(job.location, 4326),
    };

    processDrivers(job, jobType, () => {
      expect(formatSpy.returnValues[0]).to.be.an('object');
      formatSpy.restore();
      done();
    });
  });

  it('calls the model.new function', (done) => {
    const modelSpy = sinon.spy(model, 'new');
    
    processDrivers(job, jobType, () => {
      expect(modelSpy.callCount).to.equal(1);
      done();
    });
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
