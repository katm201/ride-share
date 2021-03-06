require('dotenv').config();
const newrelic = require('newrelic');

const service = require('../index');

const addReqToQueue = (request, response, next) => {
  const job = service.queue.create('ride', request.body).priority('critical').attempts(3).removeOnComplete(true);
  job.save((err) => {
    if (err) { console.log(err); }
    next();
  });
};

const middleware = {
  addReqToQueue,
};

module.exports = middleware;
