import knex from 'knex';
import bookshelf from 'bookshelf';
import knexPostgis from 'knex-postgis';
import dotenv from 'dotenv';

dotenv.config();

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 0, max: 50 },
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
