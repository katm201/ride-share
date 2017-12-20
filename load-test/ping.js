require('dotenv').config();
const axios = require('axios');

const url = 'http://localhost:3333';
// const url = process.env.EC2_URL;

const pingTest = (totalRequests) => {
  const requests = [];
  for (let i = 0; i < totalRequests; i++) {
    requests.push(axios.get(url));
  }
  axios.all(requests)
    .then(axios.spread((...args) => {
      // console.log(args);
    }))
    .catch((err) => {
      console.log(err);
    });
};

pingTest(1000);
