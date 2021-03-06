const db = require('./index');

const { pgBookshelf } = db;

const Driver = pgBookshelf.Model.extend({
  tableName: 'drivers',
  location: ['geometry'],
});

const Drivers = pgBookshelf.Collection.extend({
  model: Driver,
});

const Request = pgBookshelf.Model.extend({
  tableName: 'requests',
  start_loc: ['geometry'],
});

module.exports = {
  Driver,
  Drivers,
  Request,
};
