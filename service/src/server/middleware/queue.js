import service from '../index';

const addReqToQueue = (request, response, next) => {
  const url = `${process.env.SQS_QUEUE_URL}-new-ride`;
  const params = {
    QueueUrl: url,
    MessageBody: JSON.stringify(request.body),
  };
  service.sqs.sendMessage(params, (err) => {
    if (err) { console.log(err); }
    next();
  });
};

const middleware = {
  addReqToQueue,
};

export default middleware;
