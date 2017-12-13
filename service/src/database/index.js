import knex from 'knex';
import bookshelf from 'bookshelf';
import dotenv from 'dotenv';
import knexPostgis from 'knex-postgis';

dotenv.config();

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: {
    min: 0,
    max: 10,
    refreshIdle: false,
    reapIntervalMillis: 0,
  },
});

const st = knexPostgis(pgKnex);

const pgBookshelf = bookshelf(pgKnex);

pgBookshelf.plugin('bookshelf-postgis');

const db = {
  pgBookshelf,
  pgKnex,
  st,
};

export default db;
