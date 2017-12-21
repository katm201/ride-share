import dotenv from 'dotenv';

import db from '../../database/index';

dotenv.config();

const { st } = db;

const formatNewDriver = job => (
  {
    first_name: job.first_name,
    last_name: job.last_name,
    joined: job.joined,
    last_checkin: job.joined,
    available: true,
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

const changeBooked = job => (
  {
    booked: false,
    location: st.geomFromText(job.location, 4326),
  }
);

const updateStatus = (job) => {
  const base = {
    available: job.available,
    location: st.geomFromText(job.location, 4326),
  };
  if (!job.available) {
    base.booked = false;
  }
  return base;
};

const driverUtils = {
  formatNewDriver,
  changeBooked,
  updateStatus,
};

export default driverUtils;
