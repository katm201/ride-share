import db from './index';

const { pgBookshelf } = db;

const Driver = pgBookshelf.Model.extend({
  tableName: 'drivers',
});

const tables = {
  Driver,
};

export default tables;
