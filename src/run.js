const Conf = require('conf');
const frontmatter = require('front-matter');
const { Spinner } = require('clui');
const { findMainContentElements } = require('./html');
const { markdownToHTML, formatMarkdownImages } = require('./parser');
const { postToPlatforms } = require('./platforms/platform');

const {
  allowedPlatforms,
  displayError,
  displaySuccess,
  getRemoteDOM,
  getFileMarkdown,
  getImages,
  checkIfURLorPath
} = require('./utils');

const configstore = new Conf();
const loading = new Spinner('Processing URL...');

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
    ?.map(platform => allowedPlatforms[platform] && configstore.get(platform) && platform)
    .filter(Boolean);

  if (!platforms?.length) {
    loading.stop();
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
  const remoteDOM =
    !!remoteURL &&
    (await getRemoteDOM(remoteURL).catch(() => {
      loading.stop();
      console.error(displayError(`Invalid url | path: ${cliURLorPath}`));
      return 'Invalid url|path';
    }));

  if (remoteDOM === 'Invalid url|path') return;

  const document = remoteDOM?.window.document;

  const title =
    optTitle ||
    fmTitle ||
    document?.title
      .replace(/\| .+ \|.+Medium/, '')
      .replace('- DEV Community', '')
      .trim();

  const canonicalURL = isURL ? urlOrPath : optCanonicalUrl || fmCanonicalUrl;
  const tags = optTags || fmTags;

  const mainElement = !!document && findMainContentElements(document, remoteURL);
  const [markdownFormatted, firstImage] = !isURL
    ? formatMarkdownImages(localMarkdown, mainElement, canonicalURL)
    : [];
  const remoteMarkdown = markdownToHTML(mainElement);

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

  loading.message(`Posting article to ${platforms.join(', ')}`);
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

  return loading.stop();
}

module.exports = run;
