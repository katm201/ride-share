require('dotenv').config();
const newrelic = require('newrelic');

const service = require('../index');
const driverUtils = require('./drivers');

const { getUtilization } = driverUtils;

const sendMessage = (message) => {
  const url = `${process.env.SQS_QUEUE_URL}-driver-util`;
  const params = {
    QueueUrl: url,
    MessageBody: JSON.stringify(message),
  };
  newrelic.startBackgroundTransaction('driver-util/sqs/send-message', 'sqs', () => {
    service.sqs.sendMessage(params, (err) => {
      if (err) { console.log(err); }
      newrelic.endTransaction();
    });
  });
};

const sendMetrics = () => {
  getUtilization(sendMessage);
};

module.exports = sendMetrics;
