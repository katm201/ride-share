const db = require('../index');

const { pgKnex } = db;

// TODO: remove indexing on drivers table to see if that's faster with write speeds

pgKnex.schema.createTableIfNotExists('drivers', (table) => {
  table.increments().primary();
  table.string('last_name');
  table.string('first_name');
  table.timestamp('joined');
  table.timestamp('last_checkin');
  table.boolean('booked');
  table.boolean('available');
  table.string('location');
  table.integer('census_block_id')
    .references('gid')
    .inTable('census_blocks')
    .onDelete('cascade');
  table.index('census_block_id');
})
  .then(() => {
    console.log('drivers table created');
    return pgKnex.schema.createTableIfNotExists('requests', (table) => {
      table.increments().primary();
      table.string('ride_id').unique();
      table.string('start_loc');
      table.integer('census_block_id')
        .references('gid')
        .inTable('census_blocks')
        .onDelete('cascade');
    });
  })
  .then(() => {
    console.log('requests table created');
    return pgKnex.schema.createTableIfNotExists('requests_drivers', (table) => {
      table.increments().primary();
      table.integer('driver_id')
        .notNullable()
        .references('id')
        .inTable('drivers')
        .onDelete('cascade');
      table.integer('request_id')
        .notNullable()
        .references('id')
        .inTable('requests')
        .onDelete('cascade');
    });
  })
  .then(() => {
    console.log('requests_drivers table created');
    return pgKnex.destroy();
  })
  .then(() => {
    console.log('table creation completed');
  });
