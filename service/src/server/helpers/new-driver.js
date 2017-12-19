import dotenv from 'dotenv';

import db from '../../database/index';
import tables from '../../database/config';

dotenv.config();

const { st } = db;
const { Driver } = tables;

const addDriver = (job) => {
  const driver = {
    first_name: job.first_name,
    last_name: job.last_name,
    joined: job.joined,
    last_checkin: job.joined,
    available: true,
    booked: false,
    location: st.geomFromText(job.location, 4326),
  };
  return Driver.forge(driver);
};

export default addDriver;
