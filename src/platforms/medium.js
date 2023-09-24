const axios = require('axios');
const Conf = require('conf');

const configstore = new Conf();

/**
 * Post article to Medium
 *
 * @param {string} title Title of article
 * @param {string} content Content of article in markdown
 * @param {string} canonicalURL URL of original article
 * @param {boolean} p Whether to publish article publicly or not
 */
function postToMedium({ title, content, canonicalURL, p }) {
  const mediumConfig = configstore.get('medium');
  return axios.post(
    `https://api.medium.com/v1/users/${mediumConfig.authorId}/posts`,
    {
      title,
      contentFormat: 'markdown',
      content,
      canonicalURL,
      publishStatus: p ? 'public' : 'draft'
    },
    {
      headers: {
        Authorization: `Bearer ${mediumConfig.integrationToken}`
      }
    }
  );
}

module.exports = postToMedium;
