import db from '../index';

const { pgKnex } = db;

pgKnex.schema.createTableIfNotExists('drivers', (table) => {
  table.increments();
  table.string('name');
  table.timestamps();
  // table.integer('location');
}).then(() => {
  console.log('drivers table created');
  return pgKnex.destroy();
}).then(() => {
  console.log('table creation completed');
});
