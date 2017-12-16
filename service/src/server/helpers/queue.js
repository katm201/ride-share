import service from '../index';

const checkQueue = () => {
  service.queue.active((err, ids) => {
    if (err) { console.log(err); }
    console.log(ids);
  });
};

const helpers = {
  checkQueue,
};

export default helpers;
