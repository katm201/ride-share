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
      return pgKnex.destroy();
    })
    .then(() => {
      console.log(`connection closed for section ${section}`);
      const stop = new Date();
      console.log(stop.toISOString());
    })
    .catch((err) => {
      console.log(err);
      return pgKnex.destroy();
    });
};

seed(0)
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(1);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(2);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(3);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(4);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(5);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(6);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(7);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(8);
  })
  .then(() => {
    pgKnex = knex({
      client: 'pg',
      connection: process.env.PG_CONNECTION_STRING,
    });
    return seed(9);
  })
  .catch((err) => {
    console.log(err);
  });
