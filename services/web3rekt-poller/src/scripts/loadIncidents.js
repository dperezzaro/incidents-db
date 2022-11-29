const bent = require('bent');
const debug = require('debug')('scripts:loadIncidents');
const { endpoints: { incidents } } = require('../config');
const Web3Rekt = require('../lib/Web3Rekt');

const post = bent(incidents, 'POST', 'json', 200);

// Expected date format: 'yyyy-mm-day'
const [startDate, endDate] = process.argv.slice(2);

const run = async () => {
  const web3Rekt = new Web3Rekt();
  debug('run');
  await web3Rekt.getIncidents({
    start: Math.round(new Date(startDate || '2011-06-01') / 1000),
    end: Math.round((endDate ? new Date(endDate) : Date.now()) / 1000),
    onData: async (data) => {
      const res = await post('/bulk', data);
      debug('post:', res);
    },
  });
  debug('end');
};

run().catch(console.error); // eslint-disable-line
