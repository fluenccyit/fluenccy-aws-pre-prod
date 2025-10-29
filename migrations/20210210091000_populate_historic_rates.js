exports.up = (knex) => {
  return knex('rate').insert([
    ...require('../data/rates-eur-usd.json'),
    ...require('../data/rates-gbp-usd.json'),
    ...require('../data/rates-aud-usd.json'),
    ...require('../data/rates-nzd-usd.json'),
    ...require('../data/rates-usd-jpy.json'),
    ...require('../data/rates-usd-cad.json'),
  ]);
};

exports.down = (knex) => {
  return knex('rate').del();
};
