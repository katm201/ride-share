import dotenv from 'dotenv';
import newrelic from 'newrelic';

import db from '../../database/index';

dotenv.config();

const { pgKnex, st } = db;

const formatNewDriver = job => (
  {
    first_name: job.first_name,
    last_name: job.last_name,
    joined: job.joined,
    last_checkin: job.joined,
    available: true,
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

const changeBooked = job => (
  {
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

const updateStatus = (job) => {
  const base = {
    available: job.available,
    location: st.geomFromText(job.location, 4326),
  };
  if (!job.available) {
    base.booked = false;
  }
  return base;
};

const getTotalCount = () => (pgKnex('drivers').count('id'));

const getBookedCount = () => (pgKnex('drivers').count('id').where({ booked: true }));

const getUnavailableCount = () => (pgKnex('drivers').count('id').where({ available: false }));

const getUtilization = (callback) => {
  const utilization = {};
  newrelic.startBackgroundTransaction('driver-util/knex/total', 'db', () => {
    getTotalCount()
      .then((totalDrivers) => {
        newrelic.endTransaction();
        utilization.total = parseInt(totalDrivers[0].count, 10);
        newrelic.startBackgroundTransaction('driver-util/knex/booked', 'db', () => {
          getBookedCount()
            .then((bookedDrivers) => {
              newrelic.endTransaction();
              utilization.booked = parseInt(bookedDrivers[0].count, 10);
              newrelic.startBackgroundTransaction('driver-util/knex/unavailable', 'db', () => {
                getUnavailableCount()
                  .then((unavailableDrivers) => {
                    newrelic.endTransaction();
                    utilization.unavailable = parseInt(unavailableDrivers[0].count, 10);
                    callback(utilization);
                  })
                  .catch((err) => { console.log(err); });
              });
            })
            .catch((err) => { console.log(err); });
        });
      })
      .catch((err) => { console.log(err); });
  });
};

const driverUtils = {
  formatNewDriver,
  changeBooked,
  updateStatus,
  getUtilization,
};

export default driverUtils;
