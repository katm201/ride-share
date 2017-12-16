const axios = require('axios');

const url = process.env.EC2_URL;

let success = 0;
let error = 0;

for (var i = 0; i < 100; i++) {
  axios.get(url)
    .then((response) => {
      success++;
      console.log(response.data);
      console.log('successes ', success);
    })
    .catch((err) => {
      error++;
      console.log(err.code);
      console.log('errors', error);
    });
}
