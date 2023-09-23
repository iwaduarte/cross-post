const fs = require('fs');
const path = require('path');
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
  prefixUrl
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

const postToPlatforms = async (title, markdown, url, image, shouldPublish, platforms) => {
  await Promise.all(
    platforms.map(platform => {
      loading.message(`Posting article to ${platform}`);
      return platformMap[platform](title, markdown, url, image, shouldPublish)
        .then(() =>
          console.log(
            displaySuccess(`Article ${shouldPublish ? 'published' : 'added to drafts'} on ${platform} at ${url}`)
          )
        )
        .catch(err => {
          const {
            response: { data }
          } = err;
          handleError(
            new Error(
              `An error occurred while cross posting to [${platform}]: \n[HTTP_STATUS: ${data.status}]\n - ${data.error}`
            )
          );
        });
    })
  );
  loading.stop();
  process.exit();
};

const checkIfURLorPath = urlOrPath => {
  if (
    //google.(md|mdx) valid domain and potential markdown file
    (urlOrPath.endsWith(`.md`) || urlOrPath.endsWith(`.mdx`)) &&
    fs.existsSync(path.resolve(process.cwd(), urlOrPath))
  ) {
    return [urlOrPath, false];
  }
  try {
    const formattedUL = prefixUrl(urlOrPath, 'https://');
    new URL(formattedUL);
    return [formattedUL, true];
  } catch (err) {
    return [urlOrPath, false];
  }
};

const getFileMarkdown = async markdownPath => {
  // publish from a local file
  const filePath = path.resolve(process.cwd(), markdownPath);
  if (path.extname(filePath).toLowerCase().indexOf('md') === -1) {
    handleError('File extension not allowed. Only markdown files are accepted');
    return;
  }
  return fs.readFileSync(filePath, 'utf-8');
};

/**
 *
 * @param {string} cliURLorPath URL of the blog post
 * @param {object} options The parameters from the command line
 */
async function run(cliURLorPath, options) {
  const { title, imageUrl, canonicalUrl, platforms: userPlatforms, publish = false } = options;

  loading.start();

  const platforms = userPlatforms
    .map(platform => allowedPlatforms[platform] && configstore.get(platform) && platform)
    .filter(Boolean);

  if (!platforms.length) {
    return console.error(displayError(`Invalid platforms: ${userPlatforms}`));
  }

  const [urlOrPath, isURL] = checkIfURLorPath(cliURLorPath);
  const localMarkdown = !isURL && (await getFileMarkdown(urlOrPath));

  const content = !isURL ? frontmatter(localMarkdown) : {};
  const { attributes: { canonical_url: fmCanonicalUrl, main_image: mainImage, title: fmTitle } = {} } = content || {};
  const remoteURL = isURL ? urlOrPath : canonicalUrl || fmCanonicalUrl;
  const remoteDOM = await getRemoteDOM(remoteURL);
  const document = remoteDOM.window.document;

  const _title = title || fmTitle || document.title;
  const _canonicalURL = isURL ? urlOrPath : canonicalUrl || fmCanonicalUrl;

  const mainElement = findMainContentElements(document.body);
  const [markdownFormatted, firstImage] = !isURL ? formatMarkdownImages(localMarkdown, mainElement, _canonicalURL) : [];
  const markdown = !isURL ? markdownFormatted : turndownService.turndown(mainElement);

  const _image = imageUrl || mainImage || firstImage;

  console.log(displaySuccess('\n\ntitle:', _title));
  console.log(displaySuccess('canonicalURL:', _canonicalURL));
  console.log(displaySuccess('image:', _image));
  console.log(displaySuccess('platforms:', platforms), `\n`);

  await postToPlatforms(_title, markdown, _canonicalURL, _image, publish, platforms);
}

module.exports = run;
