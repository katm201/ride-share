require('dotenv').config();
const axios = require('axios');
const prompt = require('prompt');

const pingTest = (totalRequests, url) => {
  for (let i = 0; i < totalRequests; i++) {
    axios.get(url)
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  }
};

prompt.start();

prompt.get(['totalPings', 'toLocal'], (err, result) => {
  console.log(`Input recieved: sending ${result.totalPings} to ${result.toLocal === 'true' ? 'local /' : 'deployed /'}`);
  const baseUrl = result.toLocal === 'true' ? `http://localhost:${process.env.PORT}` : process.env.EC2_URL;
  pingTest(result.totalPings, `${baseUrl}/`);
});

