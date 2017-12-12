import express from 'express';
import dotenv from 'dotenv';

import router from './routes';

dotenv.config();

const server = express();

server.use('/', router);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);
console.log(process.env.FAKE_KEY);

export default server;
