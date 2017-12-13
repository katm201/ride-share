import db from '../index';

const { pgKnex } = db;

pgKnex.schema.createTableIfNotExists('drivers', (table) => {
  table.increments();
  table.string('name');
  table.timestamp('last_checkin');
  table.timestamp('joined');
  table.boolean('booked');
  table.boolean('available');
  table.string('location');
}).then(() => {
  console.log('drivers table created');
  return pgKnex.destroy();
}).then(() => {
  console.log('table creation completed');
});
