/* eslint-disable */
const expect = require('chai').expect;

require('dotenv').config();

const db = require('../service/build/database/index.js');
const tables = require('../service/build/database/config.js');
const helpers = require('../service/build/database/setup/helpers.js');

const { pgKnex } = db.default;
const { Driver } = tables.default;
const { createDrivers } = helpers.default;

describe('drivers table', () => {
  const tester = createDrivers(1)[0];

  afterEach(() => {
    pgKnex.destroy();
  })

  it('Driver model can be used to insert into the database', (done) => {
    Driver.forge(tester).save().then((response) => {
      expect(response.attributes.name).to.equal(tester.name);

      return response.destroy();
    })
    .then((response) => {
      done();
    })
    .catch((err) => {
      console.log(err);
    });
  });
});

/* eslint-enable */
