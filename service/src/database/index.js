import knex from 'knex';
import bookshelf from 'bookshelf';
import dotenv from 'dotenv';
import knexPostgis from 'knex-postgis';

dotenv.config();

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
