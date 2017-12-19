import dotenv from 'dotenv';

dotenv.config();

import newrelic from 'newrelic';
import AWS from 'aws-sdk';

const sqs = new AWS.SQS({
  region: 'us-east-2',
  maxRetries: 15,
  apiVersion: '2012-11-05',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),
});

const pollSQS = () => {
  sqs.receiveMessage({ QueueUrl: process.env.SQS_QUEUE_URL }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
};

// const messageParams = {
//   DelaySeconds: 0,
//   MessageAttributes: {
//     Title: {
//       DataType: 'String',
//       StringValue: 'New Message!',
//     },
//     Author: {
//       DataType: 'String',
//       StringValue: 'Katherine',
//     },
//   },
//   MessageBody: 'First message from Katherine!',
//   QueueUrl: process.env.SQS_QUEUE_URL,
// };

// sqs.sendMessage(messageParams, (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// });



// service.sqs.receiveMessage(recieveParams, (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// });

export default pollSQS;
