import dotenv from 'dotenv';

dotenv.config();

import newrelic from 'newrelic';
import { Router } from 'express';

import middleware from './middleware/queue';

const router = Router();

const { addReqToQueue } = middleware;

router.get('/', (request, response) => {
  newrelic.setTransactionName('get /');
  response.status(200).end('Hello Katherine!');
});

router.post('/new_ride', addReqToQueue, (request, response) => {
  newrelic.setTransactionName('post /new_ride');
  response.status(201).end();
});

export default router;
