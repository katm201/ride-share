require('dotenv').config();

const fs = require('fs');
const path = require('path');
const knex = require('knex');

const pgKnex = knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 0, max: 10 },
});

const formatData = (data) => {
  const queries = data.split(';');
  const valueStrings = queries.map((query) => {
    const values = query.slice(query.indexOf(')') + 12, -3);
    return values;
  });
  const inserts = valueStrings.slice(0, -1).map((string) => {
    const values = string.split('\',\'');
    const info = {
      aland10: parseInt(values[0], 10),
      awater10: parseInt(values[1], 10),
      countyfp10: values[2],
      tractce10: values[3],
      mtfcc10: values[4],
      name10: values[5],
      namelsad10: values[6],
      intptlon10: values[7],
      funcstat10: values[8],
      intptlat10: values[9],
      statefp10: values[10],
      geoid10: values[11],
      geom: values[12],
    };
    return info;
  });
  return inserts;
};

fs.readFile(path.join(__dirname, 'SHAPEFILE.sql'), 'utf8', (err, data) => {
  console.log(data);
  // const inserts = formatData(data);

  // pgKnex.batchInsert('census_blocks', inserts, 1000)
  //   .then((response) => {
  //     console.log(response);
  //     console.log('complete');
  //     pgKnex.destroy();
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  pgKnex.raw(data)
    .then((response) => {
      console.log(response, 'complete');
      pgKnex.destroy();
    })
    .catch((err) => {
      console.log(err);
      pgKnex.destroy();
    });
});

