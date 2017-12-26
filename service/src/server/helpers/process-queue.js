import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';
import newRide from './new-rides';
import driverUtils from './drivers';
import tables from '../../database/config';

dotenv.config();

const { Driver } = tables;

const { formatNewDriver, changeBooked, updateStatus } = driverUtils;

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

const model = {
  new: info => (Driver.forge(info).save()),
  complete: (info, id) => (Driver.forge({ id }).save(info, { patch: true })),
  update: (info, id) => (Driver.forge({ id }).save(info, { patch: true })),
};

// TODO: completeDriver should also come with a timestamp (needs to be added)
const formatDriver = {
  new: formatNewDriver,
  complete: changeBooked,
  update: updateStatus,
};

const processDrivers = (job, jobType, callback) => (
  newrelic.startBackgroundTransaction(`${jobType}-driver/bookshelf/query`, 'db', () => {
    console.log(job);
    const info = formatDriver[jobType](job);
    const id = job.driver_id;
    model[jobType](info, id)
      .then(() => {
        newrelic.endTransaction();
        callback();
      })
      .catch((err) => {
        console.log('error', err);
      });
  })
);

const queue = {
  processDrivers,
  processRides,
};

export default queue;
