const axios = require('axios');
const Configuration = require('conf');
const configstore = new Configuration();

/** Format markdown to cater for specific dev.to rules:
 * Frontmatter
 * - properties should be unquoted i.e. title: "Unquoted" (wrong) => Unquoted (correct)
 * - date property should be at least 15 min older (if older post, property should be removed)
 * - tags property should have a maximum of 4 tags
 * - publish property should be set in case public post is wanted
 * - canonical_url has higher precedence that the variable at the POST request
 *
 * UI Recommendations:
 * - It complains if titles are h1<#> or h3 <###>. It recommends h2<##>
 *
 * Embeds (Body transformation):
 * embed files should add the {% <name of embed> <link> %} i.e.
 * https://youtube.com/aWASKDAS => {% youtube https://youtube.com/aWASKDAS %}
 * https://codepen.com/whatever => {% codepen https://codepen.com/aWASKDAS %}
 * *
 *
 */
const formatMarkdownForDev = () => {};

/**
 * Post article to dev.to
 *
 * @param {string} title Title of article
 * @param {string} markdown Content of the article in markdown
 * @param {string} canonicalUrl URL of original article
 * @param {string} mainImage Cover image URL
 * @param {boolean} published whether to publish as draft or public
 */
function postToDev({ title, markdown, canonicalUrl, mainImage, published }) {
  const article = {
    title,
    published,
    body_markdown: markdown,
    canonical_url: canonicalUrl
  };
  if (mainImage) {
    article.main_image = mainImage;
  }
  // send article to DEV.to
  return axios.post(
    'https://dev.to/api/articles',
    {
      article
    },
    {
      headers: {
        Accept: 'application/vnd.forem.api-v1+json',
        'api-key': configstore.get('dev').apiKey
      }
    }
  );
}

module.exports = postToDev;
