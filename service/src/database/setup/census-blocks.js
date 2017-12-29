const fs = require('fs');
const path = require('path');

const { pgKnex } = require('../index');

fs.readFile(path.join(__dirname, 'shapefile.sql'), 'utf8', (err, data) => {
  pgKnex.raw(data)
    .then(() => {
      console.log('complete');
      return pgKnex.destroy();
    })
});


