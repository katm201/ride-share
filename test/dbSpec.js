/* eslint-disable */
const expect = require('chai').expect;

require('dotenv').config();

const db = require('../service/src/database/index.js');
const tables = require('../service/src/database/config.js');
const helpers = require('../service/src/database/setup/helpers.js');

const { pgKnex, st } = db;
const { Driver, Request } = tables;
const { createDrivers, createRequests } = helpers;

describe('Inventory models', () => {
  const driverTester = createDrivers(1)[0];
  const requestTester = createRequests(1)[0];

  after(() => {
    pgKnex.destroy();
  })

  it('Driver model can be used to insert a record into or remove a record from the database', (done) => {
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

  it('Requests model can be used to insert a record into or remove a record from the database', (done) => {
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

// describe('');

/* eslint-enable */
