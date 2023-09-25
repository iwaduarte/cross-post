const configstore = require('../config-store');
const { displayError, displaySuccess } = require('../utils');

const config = response => {
  const { apiKey } = response || {};

  if (!apiKey) return console.error(displayError('API key is required'));

  configstore.set('dev', { apiKey });
  console.log(displaySuccess('Configuration saved successfully'));
};

module.exports = { config };
