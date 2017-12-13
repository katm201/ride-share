import knex from 'knex';
import bookshelf from 'bookshelf';
import dotenv from 'dotenv';

dotenv.config();

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
});

const pgBookshelf = bookshelf(pgKnex);

const db = {
  pgBookshelf,
  pgKnex,
};

export default db;
