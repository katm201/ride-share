const createLocation = () => {
  const minLat = -122.75;
  const minLog = 36.8;
  const lat = (minLat + Math.random()).toPrecision(4);
  const log = (minLog + Math.random()).toPrecision(4);
  return `POINT(${lat} ${log})`;
};

const createTime = (start = 1483257600000) => {
  const lastMs = 1491030000000;
  const addTime = Math.floor(Math.random() * (lastMs - start));
  return new Date(start + addTime);
};

const helpers = {
  createTime,
  createLocation,
};

export default helpers;
