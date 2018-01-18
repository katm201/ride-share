require('dotenv').config();
const newrelic = require('newrelic');
const Promise = require('bluebird');

const service = require('../index');
const processQueues = require('./process-queue');

// helper functions that processe driver
// updates based on job type
const processDrivers = {
  // creates a new driver in inventory
  new: messages => (
    processQueues.processNewDrivers(messages, 'new')
  ),
  // closes out a ride that a driver was on, also
  // updating the driver's location
  complete: messages => (
    Promise.map(messages, message => (
      processQueues.processDrivers(message, 'complete')
    ))
  ),
  // updates a driver's location and/or availability for work
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
    // get the messages from the proper SQS queue
    service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
      newrelic.endTransaction();
      if (err) { console.log(err); }
      // if there are messages to recieve
      if (data.Messages) {
        // strip out the message bodies into a single array
        let messages = data.Messages.map(message => (JSON.parse(message.Body)));
        // strip out the reciept handles into a single array
        let receiptHandles = data.Messages.map(message => (message.ReceiptHandle));
        // calls the helper function above for the appropriate
        // job type
        processDrivers[shortJobType](messages)
          .then(() => (
            // once complete, use helper function to delete
            // messages we've processed from the SQS queue
            deleteMessages(receiptHandles, jobType)
          ))
          // force garbage collection for setInterval
          // to fix memory leak problems
          .then(() => {
            messages = null;
            receiptHandles = null;
          })
          .catch((err) => { console.log(err); });
      }
    });
  });
};

// polling SQS at interval on the server triggers this
const pollSQS = () => {
  pollQueues('new-driver');
  pollQueues('complete-driver');
  pollQueues('update-driver');
};

module.exports = { pollSQS, processDrivers };
