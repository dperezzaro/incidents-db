const querystring = require('querystring');
const config = require('./config');
const parseMongoQuery = require('./lib/parseMongoQuery');
const schemas = require('./schemas');

const routes = async (fastify) => {
  const collection = fastify.mongo.db().collection(config.mongo.collection);

  // GET / | find documents
  fastify.get('/', { schema: schemas.get }, async (request) => {
    const { query } = request;
    const {
      limit = 20, offset = 0, order, fields, ...filters
    } = parseMongoQuery(query);

    let next = null;
    const total = await collection.count(filters);
    if (total === 0) {
      return { total, data: [], next };
    }

    const stages = [{ $match: filters }];
    if (order) {
      stages.push({ $sort: order });
    }
    stages.push({ $skip: offset * limit });
    stages.push({ $limit: limit });
    if (fields) {
      stages.push({ $project: fields });
    }

    const data = await collection.aggregate(stages).toArray();
    if (data.length === limit) {
      next = querystring.stringify({
        ...query,
        offset: offset + limit,
      });
      next = `?${next}`;
    }
    return { total, data, next };
  });

  // POST /bulk | upsert multiple documents
  fastify.post('/bulk', { schema: schemas.bulkPost }, async (request) => {
    const batch = collection.initializeUnorderedBulkOp();
    const now = Math.round(Date.now() / 1000);

    request.body.forEach(({ id: _id, ...doc }) => {
      batch.find({ _id }).upsert().updateOne({
        $setOnInsert: { createdAt: now },
        $set: { updatedAt: now, ...doc },
      });
    });

    const {
      result: { nUpserted, nMatched, nModified },
    } = await batch.execute();

    return { nUpserted, nMatched, nModified };
  });
};

module.exports = routes;
