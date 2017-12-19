import dotenv from 'dotenv';

dotenv.config();

import newrelic from 'newrelic';
import knex from 'knex';
import bookshelf from 'bookshelf';
import knexPostgis from 'knex-postgis';

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
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
