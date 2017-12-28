require('dotenv').config();

const AWS = require('aws-sdk');
const prompt = require('prompt');

const { createLocation } = require('../service/src/database/setup/helpers');

const sqs = new AWS.SQS({
  region: 'us-east-2',
  maxRetries: 15,
  apiVersion: '2012-11-05',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),
});

const getDriver = () => {
  const location = createLocation();
  const id = Math.floor((Math.random() * 500000) + 1);
  const available = Math.random() > 0.5;

  return {
    driver_id: id,
    location,
    available,
  };
};

const sendDriverUpdate = (count, url) => {
  for (let i = 0; i < count; i++) {
    const message = {
      QueueUrl: url,
      MessageBody: JSON.stringify(getDriver()),
    };

    sqs.sendMessage(message, (err) => {
      if (err) { console.log(err); }
    });

    if (i % 100 === 0) { console.log(i); }
  }
};

prompt.start();

prompt.get(['totalDrivers', 'toDev'], (err, result) => {
  console.log(`Input recieved: sending ${result.totalDrivers} to ${result.toDev === 'true' ? 'dev queue' : 'deployed queue'}`);
  const baseUrl = result.toDev === 'true' ? process.env.SQS_QUEUE_URL : process.env.SQS_QUEUE_URL.slice(0, -4);
  sendDriverUpdate(result.totalDrivers, `${baseUrl}-update-driver`);
});
