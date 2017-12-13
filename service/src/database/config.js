import db from './index';

const { pgBookshelf } = db;

const Driver = pgBookshelf.Model.extend({
  tableName: 'drivers',
  location: ['geometry'],
});

// Driver.prototype.hasTimestamps = true;

const tables = {
  Driver,
};

export default tables;
