import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';
import driverUtils from './drivers';

dotenv.config();

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

export default sendMetrics;
