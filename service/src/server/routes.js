require('dotenv').config();
const newrelic = require('newrelic');
const { Router } = require('express');

const { addReqToQueue } = require('./middleware/queue');

const router = Router();

router.get('/', (request, response) => {
  newrelic.setTransactionName('get /');
  response.status(200).end('Hello Katherine!');
});

router.post('/new_ride', addReqToQueue, (request, response) => {
  newrelic.setTransactionName('post /new_ride');
  response.status(201).end();
});

module.exports = router;
