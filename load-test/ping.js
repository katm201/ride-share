const axios = require('axios');

const url = 'http://ec2-52-14-4-98.us-east-2.compute.amazonaws.com/';

let success = 0;
let error = 0;

for (var i = 0; i < 100; i++) {
  const multipleOf5 = i % 5 === 0;
  axios.get(url)
    .then((response) => {
      success++;
      if (multipleOf5) {
        console.log(response.data);
        console.log('successes ', success)
      }
    })
    .catch((err) => {
      error++;
      if (multipleOf5) {
        console.log(err.code);
        console.log('errors', error)
      }
    });
}

// console.log(success / (success + error));