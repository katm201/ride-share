import express from 'express';
import bodyParser from 'body-parser';
import kue from 'kue';
import dotenv from 'dotenv';

import router from './routes';

dotenv.config();
export const queue = kue.createQueue();

export const server = express();

server.use(bodyParser.json());

server.use('/', router);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);
