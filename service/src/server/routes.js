import { Router } from 'express';

const router = Router();

router.get('/', (request, response) => {
  response.status(200).end('Hello world');
});

export default router;
