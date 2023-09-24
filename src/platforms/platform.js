const { displaySuccess, handleError } = require('../utils');
const postToDev = require('./devto');
const postToMedium = require('./medium');
const postToHashnode = require('./hashnode');

const platformMap = {
  dev: postToDev,
  medium: postToMedium,
  hashnode: postToHashnode
};

const postToPlatforms = async ({
  title,
  markdown,
  canonicalURL,
  mainImage,
  tags,
  shouldPublish,
  platforms,
  markdownBody
}) => {
  await Promise.all(
    platforms?.map(platform => {
      return platformMap[platform]({
        title,
        markdown,
        markdownBody,
        canonicalURL,
        mainImage,
        tags,
        shouldPublish
      })
        .then(() => {
          console.log(
            displaySuccess(` \nArticle ${title} ${shouldPublish ? 'published' : 'drafted'} on ${platform}`)
          );
        })
        .catch(err => {
          const { response: { data } = {} } = err || {};
          const { status, error, errors } = data || {};

          const errorMessage =
            error ||
            errors?.[0]?.message
              ?.substring(errors[0].message.lastIndexOf('};'))
              .replace(/^[^a-zA-Z0-9]+/, '') ||
            `Some error occurred with ${platform}`;
          const statusMessage = status ? `[HTTP_STATUS: ${data.status}]` : '';

          handleError(
            new Error(
              `An error occurred while cross posting to [${platform}]: \n${statusMessage}\n - ${errorMessage}`
            )
          );
        });
    })
  );
};

module.exports = { postToPlatforms };
