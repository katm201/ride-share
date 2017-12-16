import { queue } from '../index';

export const addReqToQueue = (request, response, next) => {
  const job = queue.create('ride', request.body).priority('critical').attempts(3);
  job.save((err) => {
    if (err) { console.log(err); }
    next();
  });
};

