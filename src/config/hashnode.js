const { default: axios } = require('axios');
const { displayError, displaySuccess } = require('../utils');
const configstore = require('../config-store');

const getUserId = (username, apiKey) =>
  axios.post(
    'https://api.hashnode.com',
    {
      query: `
                query user($username: String!) {
                    user(username: $username) {
                        publication {
                            _id
                        }
                    }
                }
            `,
      variables: {
        username
      }
    },
    {
      headers: {
        Authorization: apiKey
      }
    }
  );

const config = async response => {
  const { apiKey, username } = response || {};
  if (!apiKey || !username) return console.error(displayError('API key and username are required'));
  return getUserId(username, apiKey)
    .then(({ data }) => {
      const { user } = data?.data || {};
      const { publication_id: publicationId } = user || {};
      if (!publicationId)
        return console.error(displayError(`An error occurred fetching additional data. Please try again`));

      configstore.set('hashnode', { publicationId, apiKey });
      console.log(displaySuccess('Configuration saved successfully'));
    })
    .catch(err => {
      console.error(
        displayError(
          `An error occurred while fetching publication Id: ${err.response.data.errors[0].message}`
        )
      );
    });
};

module.exports = { config };
