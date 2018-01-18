const prompt = require('prompt');
const db = require('../index');
const helpers = require('./helpers');

const { pgKnex } = db;

const { createDrivers, createRequests, createJoins } = helpers;

// recursive seeding helper function
const seed = (totalSections, totalRecords, section = 0) => {
  // recursive case
  if (section < totalSections) {
    const batchSize = totalRecords / totalSections;
    const startCount = section * batchSize;
    const maxCount = startCount + batchSize;

    const driversCount = batchSize / 10;
    const requestsCount = batchSize / 5;

    const totalDrivers = (section + 1) * driversCount;
    const totalRequests = (section + 1) * requestsCount;

    console.log(`starting section ${section} at ${new Date().toISOString()}`);

    // creates the driver records
    createDrivers(driversCount, (drivers) => {
      console.log(`drivers build completed at ${new Date().toISOString()}`);
      // inserts the driver records into the database
      pgKnex.batchInsert('drivers', drivers, 1000)
        .then(() => {
          console.log(`${driversCount} drivers saved`);
          // creates and inserts the requests records
          const requests = createRequests(requestsCount);
          return pgKnex.batchInsert('requests', requests, 1000);
        })
        .then(() => {
          console.log(`${requestsCount} requests saved`);
          // creates and inserts the join table records
          const joinsInfo = createJoins(totalRequests - requestsCount, totalRequests, totalDrivers);
          return pgKnex.batchInsert('requests_drivers', joinsInfo, 1000);
        })
        .then(() => {
          console.log(`${batchSize} joins saved`);
          console.log(`${maxCount} total joins saved`);
          const stop = new Date();
          console.log(`completed section ${section} at ${stop.toISOString()}`);
          // recursively calls itself, incrementing which
          // section is being worked on
          seed(totalSections, totalRecords, section + 1);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
  // base case
    pgKnex.destroy();
  }
};

prompt.start();

// interactive command-line prompt to seed database with
// records by how many batches and how many total records
prompt.get(['totalSections', 'totalRecords'], (err, result) => {
  console.log(`Input recieved: batching seeding ${result.totalRecords} records into ${result.totalSections} total sections`);
  seed(result.totalSections, result.totalRecords, 0);
});
