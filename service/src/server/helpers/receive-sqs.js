import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';
import queue from './queue';

dotenv.config();

const { processDrivers } = queue;

const processSQS = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  newrelic.startBackgroundTransaction(`${jobType}/sqs/get-messages`, 'sqs', () => {
    service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
      newrelic.endTransaction();
      if (err) { console.log(err); }
      if (data.Messages) {
        data.Messages.forEach((message) => {
          processDrivers(JSON.parse(message.Body), jobType.slice(0, -7), () => {
            newrelic.startBackgroundTransaction(`${jobType}/sqs/delete-message`, 'sqs', () => {
              service.sqs.deleteMessage({
                QueueUrl: url,
                ReceiptHandle: message.ReceiptHandle,
              }, (error) => {
                newrelic.endTransaction();
                if (error) { console.log(error); }
              });
            });
          });
        });
      }
    });
  });
};

const pollSQS = () => {
  processSQS('new-driver');
  processSQS('complete-driver');
  processSQS('update-driver');
};

export default pollSQS;
