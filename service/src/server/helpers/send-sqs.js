require('dotenv').config();
const newrelic = require('newrelic');

const service = require('../index');
const driverUtils = require('./drivers');

const {
  getTotalCount,
  getBookedCount,
  getUnavailableCount,
} = driverUtils;

const sendMessage = (message) => {
  const url = `${process.env.SQS_QUEUE_URL}-driver-util`;
  let params = {
    QueueUrl: url,
    MessageBody: JSON.stringify(message),
  };
  return newrelic.startBackgroundTransaction('driver-util/sqs/send-message', 'sqs', () => {
    return service.sqs.sendMessage(params, (err) => {
      if (err) { console.log(err); }
      // force garbage collection for setInterval
      // to fix memory leak problems
      params = null;
      return newrelic.endTransaction();
    });
  });
};

const sendMetrics = () => {
  let utilization = {};
  return getTotalCount()
    .then((totalDrivers) => {
      utilization.total = totalDrivers;
      return getBookedCount();
    })
    .then((bookedDrivers) => {
      utilization.booked = bookedDrivers;
      return getUnavailableCount();
    })
    .then((unavailableDrivers) => {
      utilization.unavailable = unavailableDrivers;
      return sendMessage(utilization);
    })
    .then(() => {
      // force garbage collection for setInterval
      // to fix memory leak problems
      utilization = null;
    });
};

module.exports = sendMetrics;
