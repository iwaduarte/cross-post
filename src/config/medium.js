const { default: axios } = require('axios');
const { displayError, displaySuccess } = require('../utils');
const configstore = require('../config-store');

const getUserId = authKey =>
  axios
    .get('https://api.medium.com/v1/me', {
      headers: {
        Authorization: `Bearer ${authKey}`
      }
    })
    .then(({ data }) => {
      const { id } = data?.data || {};
      return id;
    });

const config = response => {
  const { integrationToken } = response;

  if (!integrationToken) return console.error(displayError('Integration token is required'));

  return getUserId(integrationToken)
    .then(authorId => {
      if (!authorId)
        return console.error(displayError('An error occurred fetching additional data, please try again.'));

      configstore.set('medium', { authorId, integrationToken });
      console.log(displaySuccess('Configuration saved successfully'));
    })
    .catch(() => {
      console.error(displayError('An error occurred, please try again.'));
    });
};

module.exports = { config };
