import db from '../index';
import helpers from './helpers';

const { pgKnex } = db;

const { createDrivers, createRequests } = helpers;


const start = new Date();
console.log('start: ', start.toISOString());
const driversInfo = createDrivers(10000);
const requestsInfo = createRequests(10000);

pgKnex.batchInsert('drivers', driversInfo, 1000)
  .returning('id')
  .then((ids) => {
    console.log(`${ids.length} drivers saved`);
    return pgKnex.batchInsert('requests', requestsInfo, 1000).returning('id');
  })
  .then((ids) => {
    const stop = new Date();
    console.log(`${ids.length} requests saved`);
    console.log('stop: ', stop.toISOString());
    pgKnex.destroy();
  })
  .catch((err) => {
    console.log(err);
    pgKnex.destroy();
  });

