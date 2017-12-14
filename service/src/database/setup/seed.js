import db from '../index';
import helpers from './helpers';

const { pgKnex } = db;

const { createDrivers, createRequests, createJoins } = helpers;

const seed = (maxCount) => {
  const start = new Date();
  console.log('start: ', start.toISOString());
  const driversCount = maxCount / 100;
  const requestsCount = maxCount / 5;
  const driversInfo = createDrivers(driversCount);
  const requestsInfo = createRequests(requestsCount);
  const joinsInfo = createJoins(requestsCount, driversCount);

  pgKnex.batchInsert('drivers', driversInfo, 1000)
    .returning('id')
    .then((ids) => {
      console.log(`${ids.length} drivers saved`);
      return pgKnex.batchInsert('requests', requestsInfo, 1000).returning('id');
    })
    .then((ids) => {
      console.log(`${ids.length} requests saved`);
      return pgKnex.batchInsert('requests_drivers', joinsInfo, 1000).returning('id');
    })
    .then((ids) => {
      const stop = new Date();
      console.log(`${ids.length} joins saved`);
      console.log('stop: ', stop.toISOString());
      pgKnex.destroy();
    })
    .catch((err) => {
      console.log(err);
      pgKnex.destroy();
    });
};

seed(1000000);
