/* eslint-disable */

const expect = require('chai').expect;
const axios = require('axios');

require('dotenv').config();

const port = process.env.PORT || 80;

const baseUrl = `http://localhost:${port}`;

describe('GET /', () => {
  it('responds with a status code of 200', (done) => {
    console.log(port);
    axios.get(`${baseUrl}/`)
      .then((response) => {
        expect(response.status).to.equal(200);
        done();
      })
      .catch((err) => {
        console.log('There was an error requesting / from the server', err);
      })
  })
});

/* eslint-enable */
