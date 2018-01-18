require('dotenv').config();
const newrelic = require('newrelic');
const Promise = require('bluebird');

const service = require('../index');
const { newRide } = require('./new-rides');
const driverUtils = require('./drivers');
const { Driver } = require('../../database/config');
const { pgKnex } = require('../../database/index');

const {
  changeBooked,
  updateStatus,
  getCensusBlock,
} = driverUtils;

// helper function to process new rides
const processRides = () => {
  newrelic.startBackgroundTransaction('new-rides/kue/process', 'kue', () => {
    service.queue.process('ride', 1, (job, done) => {
      newrelic.endTransaction();
      // helper function that runs all newRide queries
      newRide(job.data)
        .then(() => {
          done();
        });
    });
  });
};

// creates a Bookshelf model with the driver info
// that needs to be updated, then saves to the database
const model = (info, id) => (
  Driver.forge({ id }).save(info, { patch: true })
);

// helper functions to format the driver's info
// based on what kind of update
const formatDriver = {
  complete: changeBooked,
  update: updateStatus,
};

// helper function to process new drivers
const processNewDrivers = (jobs, jobType) => (
  newrelic.startBackgroundTransaction(`${jobType}-driver/knex/census-blocks-10`, 'db', () => (
    // new driver messages come individually, but can be
    // batchInserted with Knex, if we aggregate their info
    Promise.map(jobs, job => (
      // helper function to find the correct census block
      // for the driver's current location
      getCensusBlock(job.location, job)
    ))
      .then((response) => {
        const drivers = response.map((driver) => {
          const info = driverUtils.formatNewDriver(driver);
          return info;
        });
        return newrelic.startBackgroundTransaction(`${jobType}-driver/knex/batchInsert`, 'db', () => (
          pgKnex.batchInsert('drivers', drivers, 100)
        ));
      })
      .then(() => (newrelic.endTransaction()))
      .catch((err) => {
        console.log('error', err);
      })
  ))
);

// helper function to process driver updates
const processDrivers = (job, jobType) => (
  newrelic.startBackgroundTransaction(`${jobType}-driver/knex/census-block`, 'db', () => (
    // helper function to find the correct census block
    // for the driver's current location
    getCensusBlock(job.location)
      .then((gid) => {
        newrelic.endTransaction();
        // format's the driver's info based on jobType
        const info = formatDriver[jobType](job);
        const id = job.driver_id;
        info.census_block_id = gid;
        return newrelic.startBackgroundTransaction(`${jobType}-driver/bookshelf/update`, 'db', () => (
          // creates the model and saves it
          model(info, id)
        ));
      })
      .then(() => (newrelic.endTransaction()))
      .catch((err) => {
        console.log('error', err);
      })
  ))
);


module.exports = {
  processDrivers,
  processRides,
  formatDriver,
  processNewDrivers,
  model,
};
