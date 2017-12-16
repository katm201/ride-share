import { Router } from 'express';

import middleware from './middleware/queue';

const router = Router();

const { addReqToQueue } = middleware;

router.get('/', (request, response) => {
  response.status(200).end('Hello Katherine!');
});

router.post('/new_ride', addReqToQueue, (request, response) => {
  console.log('new request on /new_ride');
  console.log(request.body);
  response.status(201).end();
});

export default router;
