const TurndownService = require('turndown');
const { gfm } = require('joplin-turndown-plugin-gfm');
const { getImages } = require('./utils');

const turndownService = new TurndownService({
  codeBlockStyle: 'fenced'
});
turndownService.keep(['figure', 'iframe']);
turndownService.use(gfm);

const markdownToHTML = element => element && turndownService.turndown(element);
/**
 * Formats Markdown images within the provided Markdown string.
 *
 * @function
 * @name formatMarkdownImages
 * @param {string} markdown - The Markdown text that needs to be formatted.
 * @param {HTMLElement} element - The HTMLElement (from jsdom) where images will be extracted.
 * @param {string} url - The URL to be used for setting the images absolute path
 * @returns {string[]} - The formatted Markdown string.
 *
 * @example
 * const markdown = "![Alt text](/path/to/image.jpg)";
 * const element = new jsdom.window.HTMLElement('body');
 * const url = "https://example.com";
 * const result = '![Alt text](https://example.com/imagefromElement.png)'
 */
const formatMarkdownImages = (markdown, element, url) => {
  if (!element) return [markdown, null];

  const imagesSrc = getImages(element, url);
  const [firstImage] = imagesSrc;
  const GRAB_IMAGES_MARKDOWN_REGEX = /!\[(.*?)]\((.*?)\)/g;
  return [
    markdown.replace(GRAB_IMAGES_MARKDOWN_REGEX, (match, p1, p2) => {
      const newUrl = imagesSrc.shift() || p2;
      return `![${p1}](${newUrl})`;
    }),
    firstImage
  ];
};

module.exports = { formatMarkdownImages, markdownToHTML };
