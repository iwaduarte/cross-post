const configstore = require('../config-store');
const { displaySuccess } = require('../utils');

const reset = () => {
  configstore.clear();
  console.log(displaySuccess('All keys successfully reset'));
};

module.exports = { reset };
