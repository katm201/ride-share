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

const processRides = () => {
  newrelic.startBackgroundTransaction('new-rides/kue/process', 'kue', () => {
    service.queue.process('ride', 1, (job, done) => {
      newrelic.endTransaction();
      newRide(job.data)
        .then(() => {
          done();
        });
    });
  });
};

const model = (info, id) => (
  Driver.forge({ id }).save(info, { patch: true })
);

// TODO: completeDriver should also come with a timestamp (needs to be added)
const formatDriver = {
  complete: changeBooked,
  update: updateStatus,
};

const processNewDrivers = (jobs, jobType) => (
  newrelic.startBackgroundTransaction(`${jobType}-driver/knex/census-blocks-10`, 'db', () => (
    Promise.map(jobs, job => (
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

const processDrivers = (job, jobType) => (
  newrelic.startBackgroundTransaction(`${jobType}-driver/knex/census-block`, 'db', () => (
    getCensusBlock(job.location)
      .then((gid) => {
        newrelic.endTransaction();
        const info = formatDriver[jobType](job);
        const id = job.driver_id;
        info.census_block_id = gid;
        return newrelic.startBackgroundTransaction(`${jobType}-driver/bookshelf/update`, 'db', () => (
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
