/* eslint no-await-in-loop: 0 */
const bent = require('bent');
const debug = require('debug')('main');
const {
  endpoints: { incidents },
  firstDate,
  pollInitialDelay,
  pollInterval,
} = require('./config');
const { sleep } = require('./lib/utils');
const Web3Rekt = require('./lib/Web3Rekt');

const get = bent(incidents, 'json');
const post = bent(incidents, 'POST', 'json', 200);

let busy;
let stop = false;

const run = async () => {
  const web3Rekt = new Web3Rekt();
  debug('run: %j', { pollInitialDelay, pollInterval });

  await sleep(pollInitialDelay);

  while (!stop) { // eslint-disable-line
    busy = true;
    try {
      // Get newest incident
      const {
        data: [{ date } = {}],
      } = await get('?order=date|-1&limit=1&fields=date');

      await web3Rekt.getIncidents({
        start: date || firstDate,
        end: Math.round(Date.now() / 1000),
        onData: async (data) => post('/bulk', data),
      });
    } catch (err) {
      console.error('WARNING', err); // eslint-disable-line
    }
    busy = false;
    await sleep(pollInterval);
  }
};

run();

// Attempt to exit gracefully
['SIGINT', 'SIGTERM'].forEach((el) => {
  process.once(el, () => {
    debug('%s caught, halting', el);
    stop = true;

    // Wait till poller is not busy
    setInterval(() => {
      if (!busy) {
        process.exit(1);
      }
    }, 1000);

    // Otherwise force exit after a reasonable amount of time
    setTimeout(() => process.exit(1), 1000 * 60 * 5);
  });
});
