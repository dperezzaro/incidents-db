const debug = require('debug')('main');
const fastify = require('fastify')({ logger: true });
const { MongoClient } = require('mongodb');
const config = require('./config');
const routes = require('./routes');

const client = new MongoClient(config.mongo.uri);

fastify.register((instance, opts, done) => {
  instance.decorate('mongo', client);
  instance.register(routes);
  done();
});

const start = async () => {
  debug('start');
  try {
    await client.connect();
    await fastify.listen(config.server);
    debug('ready');
  } catch (err) {
    fastify.log.error(err);
    await client.close();
    process.exit(1);
  }
};

start();
