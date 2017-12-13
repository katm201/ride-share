import db from '../index';

const { pgKnex } = db;

pgKnex.schema.createTableIfNotExists('drivers', (table) => {
  table.increments();
  table.string('last_name');
  table.string('first_name');
  table.timestamp('joined');
  table.timestamp('last_checkin');
  table.boolean('booked');
  table.boolean('available');
  table.string('location');
}).then(() => {
  console.log('drivers table created');
  return pgKnex.destroy();
}).then(() => {
  console.log('table creation completed');
});
