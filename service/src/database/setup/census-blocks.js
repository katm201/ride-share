require('dotenv').config();

const fs = require('fs');
const path = require('path');
const knex = require('knex');

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 0, max: 10 },
});

// script to pipe data from the SHAPEFILE.sql file into PostgreSQL via Knex
// built for seeding the deployed database, since the Node docker container
// doesn't come with psql
fs.readFile(path.join(__dirname, 'SHAPEFILE.sql'), 'utf8', (err, data) => {
  pgKnex.raw(data)
    .then((response) => {
      console.log(response, 'complete');
      pgKnex.destroy();
    })
    .catch((err) => {
      console.log(err);
      pgKnex.destroy();
    });
});

