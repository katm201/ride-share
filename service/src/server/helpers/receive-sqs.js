require('dotenv').config();
const newrelic = require('newrelic');

const service = require('../index');
const queue = require('./process-queue');

const { processDrivers } = queue;

const processType = {
  'new-driver': processDrivers,
  'complete-driver': processDrivers,
  'update-driver': processDrivers,
};

const pollQueues = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  newrelic.startBackgroundTransaction(`${jobType}/sqs/get-messages`, 'sqs', () => {
    service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
      newrelic.endTransaction();
      if (err) { console.log(err); }
      if (data.Messages) {
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
};

module.exports = pollSQS;
