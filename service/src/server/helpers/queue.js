import service from '../index';

const checkQueue = () => {
  service.queue.inactive((err, ids) => {
    if (err) { console.log(err); }
    console.log(ids);
  });
};

const helpers = {
  checkQueue,
};

export default helpers;
