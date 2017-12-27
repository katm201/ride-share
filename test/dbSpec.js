/* eslint-disable */
const expect = require('chai').expect;
const { uuid } = require('faker').random;
const sinon = require('sinon');

require('dotenv').config();

const { server } = require('../service/src/server/index');
const { pgKnex, st } = require('../service/src/database/index.js');
const { Driver, Request } = require('../service/src/database/config.js');
const { createDrivers, createRequests } = require('../service/src/database/setup/helpers.js');
const newRideQueries = require('../service/src/server/helpers/new-rides');

const {
  newRide,
  sendDrivers,
  updateDrivers,
  addJoins,
  addRequest,
  getNearestDrivers,
} = newRideQueries;

xdescribe('Inventory models', () => {
  const driverTester = createDrivers(1)[0];
  const requestTester = createRequests(1)[0];

  it('have a Driver model that can be used to insert a record into or remove a record from the database', (done) => {
    Driver.forge(driverTester).save().then((response) => {
      expect(response.attributes.firstName).to.equal(driverTester.name);
      expect(response.attributes.lastName).to.equal(driverTester.lastName);
      expect(response.attributes.location).to.equal(driverTester.location);

      return Driver.where({ id: response.attributes.id }).destroy();
    })
    .then((response) => {
      expect(response.attributes).to.be.an('object');
      expect(Object.keys(response.attributes).length).to.equal(0);
      done();
    })
    .catch((err) => {
      console.log(err);
    });
  }).timeout(8000);

  it('have a Requests model that can be used to insert a record into or remove a record from the database', (done) => {
    Request.forge(requestTester).save().then((response) => {
      expect(response.attributes.location).to.equal(requestTester.location);

      return Request.where({ id: response.attributes.id }).destroy();
    })
    .then((response) => {
      expect(response.attributes).to.be.an('object');
      expect(Object.keys(response.attributes).length).to.equal(0);
      done();
    })
    .catch((err) => {
      console.log(err);
    });
  }).timeout(8000);
});

describe('newRide function', () => {
  const closeDrivers = createDrivers(5).map((driver) => {
    driver.last_name = 'Tester';
    driver.location = st.geomFromText('POINT(-110.000005 23.000005)', 4326);
    return driver;
  });

  const farDrivers = createDrivers(5).map((driver) => {
    driver.last_name = 'Tester';
    driver.location = st.geomFromText('POINT(-115.000005 28.000005)', 4326);
    return driver;
  });

  const job = {
    start_loc: 'POINT(-110.000005 23.000005)',
  };

  let closeDriverIds = [];
  let farDriverIds = [];
  const requestIds = [];
  const joinIds = [];

  before((done) => {
    pgKnex.batchInsert('drivers', closeDrivers, 5)
      .returning('id')
      .then((ids) => {
        closeDriverIds = ids;
        return pgKnex.batchInsert('drivers', farDrivers, 5).returning('id');
      })
      .then((ids) => {
        farDriverIds = ids;
        done();
      });
  });

  beforeEach(() => {
    job.ride_id = uuid();
  });

  it('calls the getNearestDrivers query', (done) => {
    const nearestSpy = sinon.spy(getNearestDrivers);

    newRide(job)
      .then(() => {
        expect(nearestSpy.callCount).to.equal(1);
        nearestSpy.restore();
        done();
      })
      .catch(done);
  });

  xit('has a promise returned from the getNearestDrivers query', (done) => {
    done();
  });

  xit('receives the closest 5 drivers from the getNearestDrivers query', (done) => {
    done();
  });

  it('calls the updateDrivers query', (done) => {
    const updateSpy = sinon.spy(updateDrivers);

    newRide(job)
      .then(() => {
        expect(updateSpy.callCount).to.equal(1);
        updateSpy.restore();
        done();
      })
      .catch(done);
  });

  xit('has a promise returned from the updateDrivers query', (done) => {
    done();
  });

  it('calls the addRequest query', (done) => {
    const addRequestSpy = sinon.spy(addRequest);

    newRide(job)
      .then(() => {
        expect(addRequestSpy.callCount).to.equal(1);
        addRequestSpy.restore();
        done();
      })
      .catch(done);
  });

  xit('has a promise returned from the addRequest query', (done) => {
    done();
  });

  xit('receives the request id from the addRequest query', (done) => {
    done();
  });

  it('calls the addJoins query', (done) => {
    const addJoinsSpy = sinon.spy(addJoins);

    newRide(job)
      .then(() => {
        expect(addJoinsSpy.callCount).to.equal(1);
        addJoinsSpy.restore();
        done();
      })
      .catch(done);
  });

  xit('has a promise returned from the addJoins query', (done) => {
    done();
  });

  it('calls the sendDrivers function', (done) => {
    const sendDriversSpy = sinon.spy(sendDrivers);

    newRide(job)
      .then(() => {
        expect(sendDriversSpy.callCount).to.equal(1);
        sendDriversSpy.restore();
        done();
      })
      .catch(done);
  });

});

/* eslint-enable */
