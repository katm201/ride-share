import dotenv from 'dotenv';

import service from '../index';

dotenv.config();

const processSQS = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
    if (err) { console.log(err); }
    if (data.Messages) {
      const jobs = data.Messages.map(message => (service.queue.create(jobType, JSON.parse(message.Body)).priority('medium').attempts(5).save()));
      Promise.all(jobs)
        .then(() => {
          data.Messages.forEach((message) => {
            service.sqs.deleteMessage({
              QueueUrl: url,
              ReceiptHandle: message.ReceiptHandle,
            }, (error) => {
              if (error) { console.log(error); }
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
  processSQS('new-driver');
};

export default pollSQS;
