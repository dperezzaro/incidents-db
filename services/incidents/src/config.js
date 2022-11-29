const cfg = {
  mongo: {
    collection: process.env.INCIDENTS_MONGO_COLLECTION || 'incidents',
    uri: process.env.INCIDENTS_MONGO_URI
      || 'mongodb://localhost:27017/services',
  },
  server: {
    port: Number(process.env.INCIDENTS_PORT) || 3000,
    host: process.env.INCIDENTS_HOST || '0.0.0.0',
  },
};

module.exports = cfg;
