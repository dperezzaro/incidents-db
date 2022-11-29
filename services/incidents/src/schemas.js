const string = { type: 'string', minLength: 1 };

const incident = {
  type: 'object',
  required: [
    'id',
    'entity',
    'date',
    'loss',
    'currency',
    'type',
    'platform',
    'major_method',
    'extended_method',
    'category',
  ],
  properties: {
    id: string,
    entity: string,
    date: { type: 'number', minimum: 1 },
    loss: { type: 'number', minimum: 0 },
    currency: string,
    type: string,
    platform: string,
    major_method: string,
    extended_method: string,
    category: string,
  },
};

const getSchema = {
  $id: 'get',
  type: 'object',
  properties: {
    limit: { type: 'number', minimum: 1, maximum: 500 },
    offset: { type: 'number', minimum: 0 },
  },
};

const bulkPostSchema = {
  $id: 'bulkPost',
  type: 'array',
  items: incident,
};

module.exports = {
  get: { query: getSchema },
  bulkPost: { body: bulkPostSchema },
};
