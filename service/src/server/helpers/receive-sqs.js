import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';
import queue from './process-queue';

dotenv.config();

const { processDrivers, processRides } = queue;

const processType = {
  'new-driver': processDrivers,
  'complete-driver': processDrivers,
  'update-driver': processDrivers,
  // 'new-ride': processRides,
};

const pollQueues = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  newrelic.startBackgroundTransaction(`${jobType}/sqs/get-messages`, 'sqs', () => {
    service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
      newrelic.endTransaction();
      if (err) { console.log(err); }
      if (data.Messages) {
        // console.log(data.Messages);
        data.Messages.forEach((message) => {
          processType[jobType](JSON.parse(message.Body), jobType.slice(0, -7), () => {
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
  pollQueues('new-driver');
  pollQueues('complete-driver');
  pollQueues('update-driver');
  // pollQueues('new-ride');
};

export default pollSQS;
