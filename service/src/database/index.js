const knex = require('knex');
const bookshelf = require('bookshelf');
const knexPostgis = require('knex-postgis');

require('dotenv').config();

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 0, max: 200 },
});

const st = knexPostgis(pgKnex);

const pgBookshelf = bookshelf(pgKnex);

pgBookshelf.plugin('bookshelf-postgis');

module.exports = {
  pgBookshelf,
  pgKnex,
  st,
};
