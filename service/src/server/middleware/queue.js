import service from '../index';

const addReqToQueue = (request, response, next) => {
  console.log(request.body);
  const job = service.queue.create('ride', request.body).priority('critical').attempts(3).removeOnComplete(false);
  job.save((err) => {
    if (err) { console.log(err); }
    next();
  });
};

const middleware = {
  addReqToQueue,
};

export default middleware;
