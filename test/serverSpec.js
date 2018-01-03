/* eslint-disable */
require('dotenv').config();

const expect = require('chai').expect;
const sinon = require('sinon');
const axios = require('axios');
const faker = require('faker');

const { pgKnex, st } = require('../service/src/database/index.js');
const queueUtils = require('../service/src/server/helpers/process-queue');
const driverUtils = require('../service/src/server/helpers/drivers');
const sqsUtils = require('../service/src/server/helpers/receive-sqs');

const { uuid } = faker.random;
const {
  processDrivers,
  formatDriver,
  model
} = queueUtils;

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
  const jobs = [{
    first_name: 'Bobby',
    last_name: 'Tester',
    joined: '2017-01-11T00:20:21.730Z',
    location: 'POINT(-121.905535 37.586335)',
  }];

  after((done) => {
    pgKnex('drivers')
      .where('last_name', 'Tester')
      .del()
      .returning('id')
      .then(() => {
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      })
  });

  it('calls the processDrivers.new function', (done) => {
    const processSpy = sinon.spy(sqsUtils.processDrivers, 'new');
    sqsUtils.processDrivers[jobType](jobs, jobType)

    expect(processSpy.callCount).to.equal(1);
    processSpy.restore();
    done();
  });

  it('calls the processNewDrivers function', (done) => {
    const processSpy = sinon.spy(queueUtils, 'processNewDrivers');
    sqsUtils.processDrivers[jobType](jobs, jobType)
      .then(() => {
        expect(processSpy.callCount).to.equal(1);
        processSpy.restore();
        done();
      });
  });

  it('calls the formatNewDriver function', (done) => {
    const formatSpy = sinon.spy(driverUtils, 'formatNewDriver');

    sqsUtils.processDrivers[jobType](jobs, jobType)
      .then(() => {
        expect(formatSpy.callCount).to.equal(1);
        formatSpy.restore();
        done();
      });
  });
});

describe('Process complete-driver job queue', () => {
  const jobType = 'complete';
  const driver = {
      first_name: 'Bobby',
      last_name: 'Tester',
      joined: '2017-01-11T00:20:21.730Z',
      location: st.geomFromText('POINT(-121.905535 37.586335)', 4326),
      available: true,
      booked: false,
  };

  const job = {
    location: 'POINT(-121.905535 37.586335)',
  };

  before((done) => {
    pgKnex('drivers')
      .insert(driver)
      .returning('id')
      .then((ids) => {
        job.driver_id = ids[0];
        done();
      });
  });

  after((done) => {
    pgKnex('drivers')
      .where('last_name', 'Tester')
      .del()
      .then(() => {
        done();
      });
  });

  it('calls the formatDriver.complete function', (done) => {
    const formatSpy = sinon.spy(queueUtils.formatDriver, 'complete');
    
    sqsUtils.processDrivers[jobType]([job], jobType)
      .then(() => {
        expect(formatSpy.callCount).to.equal(1);
        formatSpy.restore();
        done();
      });
  });

  it('gets an object with the correct keys and values from the formatDriver.complete function', (done) => {
    const formatSpy = sinon.spy(queueUtils.formatDriver, 'complete');
    const info = {
      booked: false,
    };

    sqsUtils.processDrivers[jobType]([job], jobType)
      .then(() => {
        expect(formatSpy.returnValues[0]).to.be.an('object');
        expect(formatSpy.returnValues[0]).to.include(info);
        formatSpy.restore();
        done();
      });
  });
});

describe('Process update-driver job queue', () => {
  const jobType = 'update';

  const driver = {
      first_name: 'Bobby',
      last_name: 'Tester',
      joined: '2017-01-11T00:20:21.730Z',
      location: st.geomFromText('POINT(-121.905535 37.586335)', 4326),
      available: true,
      booked: false,
  };

  const job = {
    available: false,
    location: 'POINT(-121.905535 37.586335)',
  };

  before((done) => {
    pgKnex('drivers')
      .insert(driver)
      .returning('id')
      .then((ids) => {
        job.driver_id = ids[0];
        done();
      });
  });

  after((done) => {
    pgKnex('drivers')
      .where('last_name', 'Tester')
      .del()
      .then(() => {
        done();
      });
  });

  it('calls the formatDriver.update function', (done) => {
    const formatSpy = sinon.spy(queueUtils.formatDriver, 'update');
    
    sqsUtils.processDrivers[jobType]([job], jobType)
      .then(() => {
        expect(formatSpy.callCount).to.equal(1);
        formatSpy.restore();
        done();
      });
  });

  it('gets an object with the correct keys and values from the formatDriver.update function', (done) => {
    const formatSpy = sinon.spy(formatDriver, 'update');
    const info = {
      booked: false,
    };

    sqsUtils.processDrivers[jobType]([job], jobType)
      .then(() => {
        expect(formatSpy.returnValues[0]).to.be.an('object');
        expect(formatSpy.returnValues[0]).to.include(info);
        formatSpy.restore();
        done();
      });
  });
});

/* eslint-enable */
