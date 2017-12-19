const faker = require('faker');

const service = require('../service/build/server/index.js');

const { firstName, lastName } = faker.name;

require('dotenv').config();

const url = `${process.env.SQS_QUEUE_URL}-sqs`;

const createLocation = () => {
  const minLog = -122.75;
  const minLat = 36.8;
  const lat = (minLat + Math.random()).toPrecision(8);
  const log = (minLog + Math.random()).toPrecision(9);
  return `POINT(${log} ${lat})`;
};

const createTime = (start = 1483257600000) => {
  const lastMs = 1491030000000;
  const addTime = Math.floor(Math.random() * (lastMs - start));
  return new Date(start + addTime);
};

const createDriver = () => {
  const createdAt = createTime();
  const location = createLocation();

  return {
    first_name: firstName(),
    last_name: lastName(),
    joined: createdAt.toISOString(),
    location,
  };
};

const sendNewDriver = (count) => {
  if (count < 1) {
    return;
  }
  // const request = createRideRequest();

  const message = {
    QueueUrl: url,
    MessageBody: createDriver(),
  };

  service.sqs.sendMessage(message, (err, data) => {
    if (err) { console.log(err); }
    if (data) {
      console.log(data);
    }
    sendNewDriver(count - 1);
  });
};

sendNewDriver(10);
