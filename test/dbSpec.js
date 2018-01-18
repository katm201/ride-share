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

describe('Inventory models', () => {
  let driverTester; 
  const requestTester = createRequests(1)[0];

  before((done) => {
    createDrivers(1, (drivers) => {
      driverTester = drivers[0];
      done();
    });
  });

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

/* eslint-enable */
