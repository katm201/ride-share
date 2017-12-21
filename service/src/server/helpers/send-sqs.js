import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';

dotenv.config();

const sendMetrics = (message) => {
  const url = `${process.env.SQS_QUEUE_URL}-driver-util`;
  const params = {
    QueueUrl: url,
    message: JSON.stringify(message),
  };
  service.sqs.sendMessage(params, (err) => {
    if (err) { console.log(err); }
  });
};

export default sendMetrics;
