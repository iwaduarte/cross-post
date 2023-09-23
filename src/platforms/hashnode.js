const axios = require('axios');
const Configuration = require('conf');
const { hashnodeTags } = require('./hashnodeTags');
const store = new Configuration();
const { publicationId, apiKey } = store.get('hashnode');

/** Format markdown to cater for specific hashnode rules:
 * Frontmatter
 * Hashnode does not support markdown. It has to be removed from the file
 *
 *
 * UI Recommendations:
 * -
 *
 * Embeds (Body transformation):
 *
 *
 */
const formatMarkdownForHashnode = () => {};

const getTagsId = () => {
  return axios
    .post(
      'https://api.hashnode.com',
      {
        query: `query Tags {  tagCategories(slug:"javascript"){ _id, name, slug }}`
      },
      {
        headers: {
          Authorization: apiKey
        }
      }
    )
    .then(({ data }) => {
      data.data.tagCategories.forEach(obj => console.log(obj));
    });
};

/**
 * Post article to Hashnode
 *
 * @param {string} title Title of article
 * @param {string} markdown Content of article in Markdown
 * @param {string} canonicalURL URL of original article
 * @param {string} mainImage URL of cover image
 * @param {boolean} shouldPublish Whether to post it publicly or not
 *
 *
 */
function postToHashnode({ title, markdownBody, canonicalURL, mainImage, tags = [], shouldPublish }) {
  const data = {
    input: {
      // title,
      contentMarkdown: markdownBody,
      isPartOfPublication: { publicationId },
      //using existing tags
      tags: tags
        .map(
          tag =>
            hashnodeTags[tag] ||
            hashnodeTags[tag.replace(/[^a-zA-Z0-9-]/g, '')] ||
            hashnodeTags[tag.replace(/[^a-zA-Z0-9]/g, '')] ||
            hashnodeTags[tag.split('-')[0]] ||
            hashnodeTags[tag.split('-')[1]] ||
            null
        )
        .filter(Boolean),
      ...(canonicalURL ? { isRepublished: { originalArticleURL: canonicalURL } } : {}),
      ...(mainImage ? { coverImageURL: mainImage } : {})
    },
    publicationId: publicationId,
    hideFromHashnodeFeed: !shouldPublish
  };

  return axios
    .post(
      'https://api.hashnode.com',
      {
        query: `mutation createPublicationStory($input: CreateStoryInput!, $publicationId: String!, $hideFromHashnodeFeed: Boolean ){ \
         createPublicationStory(input: $input, publicationId: $publicationId, hideFromHashnodeFeed: $hideFromHashnodeFeed ){ \
          message } }`,
        variables: data
      },
      {
        headers: {
          Authorization: apiKey
        }
      }
    )
    .then(({ data }) => data);
}

module.exports = postToHashnode;
