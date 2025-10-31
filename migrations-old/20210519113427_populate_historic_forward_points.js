exports.up = (knex) => {
  return knex('forward_point').insert([
    ...require('../data/forward-points-aud-usd.json'),
    ...require('../data/forward-points-eur-usd.json'),
    ...require('../data/forward-points-gbp-usd.json'),
    ...require('../data/forward-points-nzd-usd.json'),
    ...require('../data/forward-points-usd-cad.json'),
    ...require('../data/forward-points-usd-jpy.json'),
  ]);
};

exports.down = (knex) => {
  return knex('forward_point').del();
};
