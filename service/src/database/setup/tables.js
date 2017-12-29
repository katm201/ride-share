const db = require('../index');

const { pgKnex } = db;

pgKnex.schema.createTableIfNotExists('census_blocks', (table) => {
  table.increments('gid').primary();
  table.float('aland10', 25);
  table.float('awater10', 25);
  table.string('countyfp10');
  table.string('tractce10');
  table.string('mtfcc10');
  table.string('name10');
  table.string('namelsad10');
  table.string('intptlon10');
  table.string('funcstat10');
  table.string('intptlat10');
  table.string('statefp10');
  table.string('geoid10');
  table.text('geom', 'longtext');
})
  .then(() => {
    console.log('census_blocks table created');
    return pgKnex.schema.createTableIfNotExists('drivers', (table) => {
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
    });
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
