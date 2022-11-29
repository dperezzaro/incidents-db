const config = {
  // Time to wait after an ECONNRESET error before attempting next fetch
  econnResetInterval: 1000 * 5,

  endpoints: {
    incidents: process.env.WEB3REKT_POLLER_INCIDENTS_ENDPOINT
      || 'http://localhost:3000',
    web3rekt: process.env.WEB3REKT_POLLER_WEB3REKT_ENDPOINT
      || 'https://www.web3rekt.com/_functions/entitydetailsbasic',
  },

  // Number of incidents to fetch per api call
  getLimit: 20,

  // Time to wait before next fetching next batch of incidents
  getBatchInterval: 1000 * 2,

  // First incident day, we need this as in the current's api implementation there
  // are no options to paginate the results
  firstDate: Math.round(new Date('2011-06-01') / 1000),

  // Time to wait before the initial poll
  pollInitialDelay: (
    Number(process.env.WEB3REKT_POLLER_INITIAL_DELAY) || 10
  ) * 1000,

  // Main poll interval
  pollInterval: (
    Number(process.env.WEB3REKT_POLLER_INTERVAL) || 60 * 60
  ) * 1000,

  // Time to wait on 429 error from Web3Rekt API
  rateLimitInterval: (
    Number(process.env.WEB3REKT_POLLER_RATE_LIMIT_INTERVAL) || 60 * 2
  ) * 1000,
};

module.exports = config;
