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
  console.log('drivers table creation completed');
});

pgKnex.schema.createTableIfNotExists('requests', (table) => {
  table.increments();
  table.string('start_loc');
}).then(() => {
  console.log('requests table created');
  return pgKnex.destroy();
}).then(() => {
  console.log('requeststable creation completed');
});
