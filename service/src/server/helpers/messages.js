import dotenv from 'dotenv';
import newrelic from 'newrelic';

import service from '../index';

dotenv.config();

const processSQS = (jobType) => {
  const url = `${process.env.SQS_QUEUE_URL}-${jobType}`;
  newrelic.startBackgroundTransaction(`${jobType}/sqs/get-messages`, 'sqs', () => {
    service.sqs.receiveMessage({ QueueUrl: url, MaxNumberOfMessages: 10 }, (err, data) => {
      newrelic.endTransaction();
      if (err) { console.log(err); }
      if (data.Messages) {
        newrelic.startBackgroundTransaction(`${jobType}/kue/save-job`, 'kue', () => {
          const jobs = data.Messages.map(message => (service.queue.create(jobType, JSON.parse(message.Body)).priority('medium').attempts(5).save()));
          Promise.all(jobs)
            .then(() => {
              newrelic.endTransaction();
              data.Messages.forEach((message) => {
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
        });
      }
    });
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
  processSQS('complete-driver');
  processSQS('driver-update');
};

export default pollSQS;
