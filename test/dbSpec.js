/* eslint-disable */
const expect = require('chai').expect;
const faker = require('faker').name;

require('dotenv').config();

const { server } = require('../service/src/server/index');
const { pgKnex, st } = require('../service/src/database/index.js');
const { Driver, Request } = require('../service/src/database/config.js');
const { createDrivers, createRequests } = require('../service/src/database/setup/helpers.js');

describe('Inventory models', () => {
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

  let closeDriverIds = [];
  let farDriverIds = [];

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

  xit('calls the getNearestDrivers query', (done) => {
    done()
  });

  xit('has a promise returned from the getNearestDrivers query', (done) => {
    done()
  });

  xit('receives the closest 5 drivers from the getNearestDrivers query', (done) => {
    done()
  });

  xit('calls the updateDrivers query', (done) => {
    done()
  });

  xit('has a promise returned from the updateDrivers query', (done) => {
    done()
  });

  xit('calls the addJoins query', (done) => {
    done()
  });

  xit('has a promise returned from the addJoins query', (done) => {
    done()
  });

  xit('calls the sendDrivers function', (done) => {
    done()
  });

});

// describe('');

/* eslint-enable */
