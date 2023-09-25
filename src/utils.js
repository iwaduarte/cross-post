const chalk = require('chalk');
const { get } = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const allowedPlatforms = { dev: true, hashnode: true, medium: true };

/**
 * Replaces the 'http' scheme with 'https' in a given URL.
 *
 * @function
 * @name enforceHTTPS
 * @param {string} url - The URL to be converted to HTTPS.
 * @returns {string|null} - The URL with 'https' scheme, or null if the input is null.
 *
 * @example
 * const url = "http://example.com";
 * const httpsUrl = enforceHTTPS(url);  // Output will be "https://example.com"
 */
const enforceHTTPS = url => url?.replace(/^(http:\/\/)/, 'https://');

const prefixUrl = (baseUrl, url) =>
  enforceHTTPS(!url.startsWith('http://') && !url.startsWith('https://') ? baseUrl + url : url);
const checkIfURLorPath = urlOrPath => {
  const _path = path.resolve(process.cwd(), urlOrPath);
  if (
    //google.(md|mdx) valid domain and potential markdown file
    (urlOrPath.endsWith(`.md`) || urlOrPath.endsWith(`.mdx`)) &&
    fs.existsSync(_path)
  ) {
    return [urlOrPath, false];
  }
  try {
    const formattedUL = prefixUrl('https://', urlOrPath);
    new URL(formattedUL);
    return [formattedUL, true];
  } catch (err) {
    return [urlOrPath, false];
  }
};
/**
 *
 * @param {Error} err Error message to display
 */
const handleError = err => {
  console.error(chalk.bold.red(err));
  process.exit();
};

const getFileMarkdown = async markdownPath => {
  // publish from a local file
  const filePath = path.resolve(process.cwd(), markdownPath);
  if (path.extname(filePath).toLowerCase().indexOf('md') === -1) {
    return handleError(new Error('File extension not allowed. Only markdown files are accepted'));
  }
  return fs.readFileSync(filePath, 'utf-8');
};

/**
 * Fetches the HTML content from a remote URL and returns it as a JSDOM object.
 *
 * @async
 * @function
 * @name getRemoteDOM
 * @param {string} url - The URL of the remote article to fetch.
 * @returns {Promise<JSDOM>} - A promise that resolves to a JSDOM object containing
 * the HTML content of the remote article.
 */
const getRemoteDOM = async url => {
  const { data } = await get(enforceHTTPS(url));
  return new JSDOM(data, { resources: 'usable', url });
};

const getImages = (element, url) => {
  if (!element || !url) return null;

  const formattedUrl = new URL(url);
  formattedUrl.pathname = '';
  formattedUrl.search = '';
  formattedUrl.hash = '';

  const baseUrl = formattedUrl.toString();

  return Array.from(element.querySelectorAll('img, picture'))
    .map(HTMLImage => {
      const { src, tagName } = HTMLImage || {};

      if (tagName.toLowerCase() === 'img') return src ? prefixUrl(baseUrl, src) : null;
      if (tagName.toLowerCase() === 'picture') {
        const { srcset } = HTMLImage.querySelector('source') || {};
        const srcsetItems = srcset.split(',');
        if (srcset) return prefixUrl(baseUrl, srcsetItems[srcsetItems.length - 1].trim().split(' ')[0]);
      }
      return null;
    })
    .filter(Boolean);
};

module.exports = {
  allowedPlatforms,
  displayError: chalk.bold.red,
  displaySuccess: chalk.bold.green,
  displayInfo: chalk.bold.blue,
  getRemoteDOM,
  prefixUrl,
  checkIfURLorPath,
  getFileMarkdown,
  getImages,
  handleError
};
