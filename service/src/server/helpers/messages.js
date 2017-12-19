import dotenv from 'dotenv';

import service from '../index';

dotenv.config();

const processSQS = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  service.sqs.receiveMessage({ QueueUrl: url }, (err, data) => {
    if (err) { console.log(err); }
    if (data.Messages) {
      console.log('messages', data.Messages);
      const jobs = data.Messages.map(message => (service.queue.create('test-new-driver', message.body).priority('medium').attempts(5).save()));
      Promise.all(jobs)
        .then(() => {
          data.Messages.forEach((message) => {
            service.sqs.deleteMessage({
              QueueUrl: url,
              ReceiptHandle: message.ReceiptHandle,
            }, (error, response) => {
              if (error) { console.log(error); }
              if (response) { console.log('deleted', response); }
            });
          });
        });
    }
  });
};

const sendMessage = (messageParams) => {
  service.sqs.sendMessage(messageParams, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
};

const pollSQS = () => {
  processSQS('sqs');
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