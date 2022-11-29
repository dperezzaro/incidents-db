const fields = [
  [/^"(.+)"$/, (v) => v],
  [/^(\d+)$/, (v) => parseInt(v, 10)],
  [/^([+-]?(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+))$/, (v) => parseFloat(v, 10)],
  [/^(null)$/, () => null],
  [/^(true|false)$/, (v) => v !== 'false'],
  [/^\/(.+\/.*)$/, (v) => RegExp(v.split('/')[0], v.split('/')[1])],
  [/^lt\|(\d+)$/, (v) => ({ $lt: parseInt(v, 10) })],
  [/^gt\|(\d+)$/, (v) => ({ $gt: parseInt(v, 10) })],
  [/^between\|(.+)$/, (v) => ({
    $gt: parseInt(v.split(',')[0], 10),
    $lt: parseInt(v.split(',')[1], 10),
  })],
  [/^regex\|(.+)$/, (v) => ({
    $regex: v.split('/')[1],
    $options: v.split('/')[2],
  })],
  [/^exists\|(true|false)$/, (v) => ({ $exists: v !== 'false' })],
];

const parse = (value) => {
  for (let i = 0; i < fields.length; i += 1) {
    const [regex, parseFn] = fields[i];
    const match = value.match(regex);
    if (match) {
      return parseFn(match[1]);
    }
  }
  return value;
};

const parseMongoQuery = (query) => Object
  .entries(query)
  .reduce((acc, [k, v]) => {
    if (k === 'order' && v.match(/^.*\|-?\d{1}$/)) {
      const [field, direction] = v.split('|');
      return { ...acc, [k]: { [field]: Number(direction) } };
    }
    if (k === 'fields') {
      return {
        ...acc,
        [k]: v.split(',').filter(Boolean)
          .reduce((facc, el) => ({ ...facc, [el]: 1 }), { _id: 0 }),
      };
    }
    if (typeof v === 'number') {
      return { ...acc, [k]: v };
    }
    return { ...acc, [k]: parse(v) };
  }, {});

module.exports = parseMongoQuery;
