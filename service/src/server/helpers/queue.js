import db from '../../database/index';
import service from '../index';

const { pgKnex } = db;

const getNearestDrivers = job => (
  pgKnex('drivers').select('*').orderByRaw(`ST_Distance(location, ST_GeometryFromText('${job.start_loc}', 4326)) DESC LIMIT 5`).where({ booked: false, available: true })
);

const updateDrivers = (drivers) => {
  const driverUpdates = drivers.map(driver => (pgKnex('drivers').where('id', driver.id).update({ booked: true })));
  return Promise.all(driverUpdates);
};

const processQueue = {
  rides: () => (
    service.queue.process('ride', 1, (job, done) => {
      getNearestDrivers(job.data)
        .then(drivers => (updateDrivers(drivers)))
        .then((response) => {
          console.log(response);
          done();
        })
        .catch((err) => {
          console.log(err);
        });
    })
  ),
};

const checkQueue = () => {
  processQueue.rides();
};

const helpers = {
  checkQueue,
};

export default helpers;
