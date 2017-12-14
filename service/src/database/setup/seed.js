import knex from 'knex';

import db from '../index';
import helpers from './helpers';

let { pgKnex } = db;

const { createDrivers, createRequests, createJoins } = helpers;

const seed = (section) => {
  const startCount = section * 1000000;
  const maxCount = startCount + 1000000;

  const driversCount = maxCount / 20;
  const requestsCount = maxCount / 5;

  const drivers = createDrivers(driversCount);

  console.log(`starting insertion, section ${section}`);

  return pgKnex.batchInsert('drivers', drivers, 1000)
    .then(() => {
      console.log(`${driversCount} drivers saved`);
      const requests = createRequests(requestsCount);
      return pgKnex.batchInsert('requests', requests, 1000);
    })
    .then(() => {
      console.log(`${requestsCount} requests saved`);
      const joinsInfo = createJoins(startCount + 1, requestsCount, driversCount);
      return pgKnex.batchInsert('requests_drivers', joinsInfo, 1000);
    })
    .then(() => {
      console.log(`${maxCount} joins saved`);
      return pgKnex.destroy();
    })
    .then(() => {
      console.log(`connection closed for section ${section}`);
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

