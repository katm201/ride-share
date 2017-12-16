import knex from 'knex';

import db from '../index';
import helpers from './helpers';

let { pgKnex } = db;

const { createDrivers, createRequests, createJoins } = helpers;

const seed = (section) => {
  const batchSize = 1000000;
  const startCount = section * batchSize;
  const maxCount = startCount + batchSize;

  const driversCount = batchSize / 20;
  const requestsCount = batchSize / 5;

  const totalDrivers = (section + 1) * driversCount;
  const totalRequests = (section + 1) * requestsCount;

  const drivers = createDrivers(driversCount);

  const start = new Date();
  console.log(start.toISOString());

  console.log(`starting insertion, section ${section}`);

  return pgKnex.batchInsert('drivers', drivers, 1000)
    .then(() => {
      console.log(`${driversCount} drivers saved`);
      const requests = createRequests(requestsCount);
      return pgKnex.batchInsert('requests', requests, 1000);
    })
    .then(() => {
      console.log(`${requestsCount} requests saved`);
      const joinsInfo = createJoins(totalRequests - requestsCount, totalRequests, totalDrivers);
      return pgKnex.batchInsert('requests_drivers', joinsInfo, 1000);
    })
    .then(() => {
        console.log(`${batchSize} joins saved`);
        console.log(`${maxCount} total joins saved`);
        const stop = new Date();
        console.log(`completed section ${section} at ${stop.toISOString()}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

seed(0)
  .then(() => {
    return seed(1);
  })
  .then(() => {
    return seed(2);
  })
  .then(() => {
    return seed(3);
  })
  .then(() => {
    return seed(4);
  })
  .then(() => {
    return seed(5);
  })
  .then(() => {
    return seed(6);
  })
  .then(() => {
    return seed(7);
  })
  .then(() => {
    return seed(8);
  })
  .then(() => {
    return seed(9);
  })
  .then(() => {
    return pgKnex.destroy();
  })
  .then(() => {
    console.log('database seeding successful');
  })
  .catch((err) => {
    console.log(err);
  });
