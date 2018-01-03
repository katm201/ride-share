require('dotenv').config();
const newrelic = require('newrelic');
const Promise = require('bluebird');

const service = require('../index');
const processQueues = require('./process-queue');

const processDrivers = {
  new: messages => (
    processQueues.processNewDrivers(messages, 'new')
  ),
  complete: messages => (
    Promise.map(messages, message => (
      processQueues.processDrivers(message, 'complete')
    ))
  ),
  update: messages => (
    Promise.map(messages, message => (
      processQueues.processDrivers(message, 'update')
    ))
  ),
};

const deleteMessages = (messageHandles, jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  return Promise.map(messageHandles, handle => (
    newrelic.startBackgroundTransaction(`${jobType}/sqs/delete-message`, 'sqs', () => (
      service.sqs.deleteMessage(
        {
          QueueUrl: url,
          ReceiptHandle: handle,
        },
        (error) => {
          newrelic.endTransaction();
          if (error) { console.log(error); }
        },
      )
    ))
  ));
};

const pollQueues = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  const shortJobType = jobType.slice(0, -7);
  newrelic.startBackgroundTransaction(`${jobType}/sqs/get-messages`, 'sqs', () => {
    service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
      newrelic.endTransaction();
      if (err) { console.log(err); }
      if (data.Messages) {
        const messages = data.Messages.map(message => (JSON.parse(message.Body)));
        const receiptHandles = data.Messages.map(message => (message.ReceiptHandle));
        processDrivers[shortJobType](messages)
          .then(() => (
            deleteMessages(receiptHandles, jobType)
          ))
          .catch((err) => { console.log(err); });
      }
    });
  });
};

const pollSQS = () => {
  pollQueues('new-driver');
  pollQueues('complete-driver');
  pollQueues('update-driver');
};

module.exports = { pollSQS, processDrivers };
