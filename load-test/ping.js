require('dotenv').config();
const axios = require('axios');

// const url = 'http://localhost:3333';
const url = process.env.EC2_URL;

const pingTest = (totalRequests) => {
  for (let i = 0; i < totalRequests; i++) {
    axios.get(url)
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  }
};

pingTest(10);
