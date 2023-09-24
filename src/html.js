const listSelectors = {
  'medium.com': {
    selector: 'article section div',
    remove: document => {
      const pageTitle = document?.title;
      const allTitles = Array.from(document?.querySelectorAll('h1'));
      const removeElement = allTitles?.find(title => pageTitle.includes(title.textContent));
      removeElement.parentNode.parentNode.removeChild(removeElement.parentNode);
      return true;
    }
  },
  'hashnode.com': { selector: '#post-content-parent' },
  'dev.com': { selector: '.crayons-article__main' }
};

/**
 * Finds the nearest common ancestor of an array of HTML elements.
 *
 * @function
 * @name findNearestCommonAncestor
 * @param {HTMLElement[]} elements - An array of HTML elements for which to find
 * the nearest common ancestor.
 * @returns {HTMLElement|null} - The nearest common ancestor element, or null
 * if the input array is empty or null.
 *
 * @example
 * const elem1 = document.getElementById('elem1');
 * const elem2 = document.getElementById('elem2');
 * const commonAncestor = findNearestCommonAncestor([elem1, elem2]);
 *
 * // commonAncestor will contain the nearest common ancestor HTMLElement or null.
 */
const findNearestCommonAncestor = elements => {
  if (elements?.length === 0) {
    return null;
  }
  const findAncestors = (element, ancestorsSet) => {
    if (element) {
      ancestorsSet.add(element);
      findAncestors(element.parentElement, ancestorsSet);
    }
  };
  const ancestorsList = elements.map(element => {
    const ancestors = new Set();
    findAncestors(element, ancestors);
    return ancestors;
  });

  const commonAncestors = ancestorsList.reduce(
    (acc, currSet) => acc.filter(ancestor => currSet.has(ancestor)),
    [...ancestorsList[0]]
  );

  return commonAncestors[0] || null;
};

/**
 * Ranks HTML elements based on how many text density it has
 * and returns the top 8 elements that contain a `<p>` tag.
 *
 * @function
 * @name rankingTags
 * @param {HTMLElement} document - The HTML jsdom element representing the root of the document.
 * @returns {HTMLElement[]} - An array of the top 8 HTMLElements that contain a `<p>` tag.
 *
 */
const rankingTags = document => {
  const elements = document.querySelectorAll('p, blockquote, h1, h2, h3, h4, h5, h6');
  const scoreTag = {
    p: 0.8,
    blockquote: 0.9,
    h1: 0.6,
    h2: 0.6,
    h3: 0.6,
    h4: 0.6,
    h5: 0.6,
    h6: 0.6
  };

  const { elementScores, elementHasPTag } = Array.from(elements).reduce(
    (acc, element) => {
      const textLength = element.textContent.length;
      const tagName = element.tagName.toLowerCase();

      if (tagName.includes('-')) {
        return acc;
      }

      const scoreMultiplier = scoreTag[tagName];
      const score = textLength * scoreMultiplier;
      const { parentElement } = element;

      if (parentElement && !parentElement.tagName.toLowerCase().includes('-')) {
        if (acc.elementScores.has(parentElement)) {
          acc.elementScores.set(parentElement, acc.elementScores.get(parentElement) + score);
        } else {
          acc.elementScores.set(parentElement, score);
        }

        if (tagName === 'p') {
          acc.elementHasPTag.set(parentElement, true);
        }
      }

      return acc;
    },
    { elementScores: new Map(), elementHasPTag: new Map() }
  );

  return Array.from(elementScores.entries())
    .filter(([parentElement, score]) => elementHasPTag.has(parentElement) && score > 200)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 4)
    .map(([element]) => element);
};
const findContent = (element, selector, remove) => {
  const mainElement = element.querySelector(selector);
  if (remove) {
    remove(element);
  }
  return mainElement;
};
const findMainContentElements = (document, url) => {
  const platformRules = listSelectors[new URL(url).host.replace(/^www./, '')];
  const { selector, remove } = platformRules || {};

  if (selector) return findContent(document, selector, remove);

  return findNearestCommonAncestor(rankingTags(document));
};

module.exports = { findMainContentElements };
