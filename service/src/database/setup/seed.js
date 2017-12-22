import prompt from 'prompt';

import db from '../index';
import helpers from './helpers';

const { pgKnex } = db;

const { createDrivers, createRequests, createJoins } = helpers;

const seed = (totalSections, totalRecords, section = 0) => {
  if (section < totalSections) {
    const batchSize = totalRecords / totalSections;
    const startCount = section * batchSize;
    const maxCount = startCount + batchSize;

    const driversCount = batchSize / 20;
    const requestsCount = batchSize / 5;

    const totalDrivers = (section + 1) * driversCount;
    const totalRequests = (section + 1) * requestsCount;

    const drivers = createDrivers(driversCount);

    const start = new Date();
    console.log(`starting insertion, section ${section} at ${start.toISOString()}`);

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
        seed(totalSections, section + 1);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    return pgKnex.destroy();
  }
};

prompt.start();

prompt.get(['totalSections', 'totalRecords'], (err, result) => {
  console.log(`Input recieved: batching seeding ${result.totalRecords} records into ${result.totalSections} total sections`);
  seed(result.totalSections, result.totalRecords, 0);
});
