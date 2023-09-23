const Conf = require('conf');
const frontmatter = require('front-matter');
const { Spinner } = require('clui');
const TurndownService = require('turndown');

const turndownService = new TurndownService({
  codeBlockStyle: 'fenced'
});

const {
  allowedPlatforms,
  displayError,
  displaySuccess,
  getRemoteDOM,
  findMainContentElements,
  formatMarkdownImages,
  checkIfURLorPath,
  getFileMarkdown,
  getImages
} = require('./utils');

const postToDev = require('./platforms/devto');
const postToHashnode = require('./platforms/hashnode');
const postToMedium = require('./platforms/medium');

const configstore = new Conf();
const loading = new Spinner('Processing URL...');

let platformsPosted = 0; // incremental count of platforms the article is posted on

/**
 *
 * @param {Error} err Error message to display
 */
function handleError(err) {
  loading.stop();
  console.error(displayError(err));
}

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
      loading.message(`Posting article to ${platform}`);
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
          // console.log(err.config.data);
          console.log(err);
          const {
            response: { data }
          } = err;
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
  loading.stop();
  process.exit();
};

/**
 *
 * @param {string} cliURLorPath URL of the blog post
 * @param {object} options The parameters from the command line
 */
async function run(cliURLorPath, options) {
  const {
    title: optTitle,
    imageUrl,
    canonicalUrl: optCanonicalUrl,
    tags: optTags,
    platforms: optPlatforms,
    publish: shouldPublish = false,
    skipImage
  } = options;

  loading.start();

  const platforms = optPlatforms
    .map(platform => allowedPlatforms[platform] && configstore.get(platform) && platform)
    .filter(Boolean);

  if (!platforms.length) {
    return console.error(displayError(`Invalid platforms: ${optPlatforms}`));
  }

  const [urlOrPath, isURL] = checkIfURLorPath(cliURLorPath);
  const localMarkdown = !isURL && (await getFileMarkdown(urlOrPath));

  const content = !isURL ? frontmatter(localMarkdown) : {};
  const {
    attributes: { canonical_url: fmCanonicalUrl, main_image: fmMainImage, title: fmTitle, tags: fmTags } = {},
    body: _markdownBody
  } = content || {};
  const remoteURL = isURL ? urlOrPath : optCanonicalUrl || fmCanonicalUrl;
  const remoteDOM = !!remoteURL && (await getRemoteDOM(remoteURL));
  const document = remoteDOM?.window.document;

  const title = optTitle || fmTitle || document?.title;
  const canonicalURL = isURL ? urlOrPath : optCanonicalUrl || fmCanonicalUrl;
  const tags = optTags || fmTags;

  const mainElement = !!document && findMainContentElements(document?.body);
  const [markdownFormatted, firstImage] = !isURL
    ? formatMarkdownImages(localMarkdown, mainElement, canonicalURL)
    : [];
  const remoteMarkdown = mainElement && turndownService.turndown(mainElement);

  const markdown = !isURL ? markdownFormatted : remoteMarkdown;
  const [markdownBody] = !isURL
    ? formatMarkdownImages(_markdownBody, mainElement, canonicalURL)
    : [remoteMarkdown, getImages(mainElement, canonicalURL)[0]];

  const mainImage = skipImage ? false : imageUrl || fmMainImage || firstImage;

  console.log(displaySuccess('\n\ntitle:', title));
  console.log(displaySuccess('canonicalURL:', canonicalURL));
  console.log(displaySuccess('image:', mainImage));
  console.log(displaySuccess('tags:', tags));
  console.log(displaySuccess('platforms:', platforms));
  console.log(displaySuccess('skipImage:', skipImage));
  console.log(displaySuccess('shouldPublish:', shouldPublish), `\n`);

  await postToPlatforms({
    title,
    markdown,
    markdownBody,
    canonicalURL,
    mainImage,
    shouldPublish,
    platforms,
    tags
  });
}

module.exports = run;
