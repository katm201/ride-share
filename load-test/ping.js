const axios = require('axios');

for (var i = 0; i < 10000; i++) {
  axios.get('http://ec2-18-217-221-192.us-east-2.compute.amazonaws.com/')
    .then((response) => {
      console.log(response.data);
    })
    .catch((err) => {
      console.log(err);
    });
}
