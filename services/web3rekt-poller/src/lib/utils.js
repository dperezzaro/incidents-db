const debug = require('debug')('lib:utils');

const sleep = (ms) => {
  debug('sleep: %d', ms);
  return new Promise((r) => { setTimeout(r, ms); });
};

module.exports = {
  sleep,
};
