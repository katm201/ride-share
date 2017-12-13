import db from './index';

const { pgBookshelf } = db;

const Driver = pgBookshelf.Model.extend({
  tableName: 'drivers',
  location: ['geometry'],
});

const Drivers = pgBookshelf.Collection.extend({
  model: Driver,
});

const tables = {
  Driver,
  Drivers,
};

export default tables;
