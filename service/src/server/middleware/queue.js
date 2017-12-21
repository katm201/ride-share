import service from '../index';

const addReqToQueue = (request, response, next) => {
  const job = service.queue.create('ride', request.body).priority('critical').attempts(3).removeOnComplete(false);
  job.save((err) => {
    if (err) { console.log(err); }
    console.log(request.body);
    next();
  });
};

const middleware = {
  addReqToQueue,
};

export default middleware;
