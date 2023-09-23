/** hashnode does not support dynamic tags
 *  It is necessary to go query partial data and then uses the Tag queried
 *  We implement a caching solution. It is limited but it is the best we can do
 *  until the new API is out.
 *
 * https://townhall.hashnode.com/hashnode-public-apis-2-closed-beta
 *
 *
 **/

const hashnodeTags = {
  javascript: {
    _id: '56744721958ef13879b94cad',
    name: 'JavaScript',
    slug: 'javascript'
  },
  reactjs: { _id: '56744723958ef13879b95434', name: 'React', slug: 'reactjs' },
  python: { _id: '56744721958ef13879b94d67', name: 'Python', slug: 'python' },
  devops: { _id: '56744723958ef13879b9550d', name: 'Devops', slug: 'devops' },
  'programming-blogs': {
    _id: '56744721958ef13879b94ae7',
    name: 'Programming Blogs',
    slug: 'programming-blogs'
  },
  beginners: {
    _id: '56744723958ef13879b955a9',
    name: 'Beginner Developers',
    slug: 'beginners'
  },
  css: { _id: '56744721958ef13879b94b91', name: 'CSS', slug: 'css' },
  aws: { _id: '56744721958ef13879b94bc5', name: 'AWS', slug: 'aws' },
  nodejs: { _id: '56744722958ef13879b94ffb', name: 'Node.js', slug: 'nodejs' },
  developer: {
    _id: '56744723958ef13879b952d7',
    name: 'Developer',
    slug: 'developer'
  },
  health: {
    _id: '5a189c9fee67ea9312f02c18',
    name: 'health',
    slug: 'health-cjaeh844x02vvo3wtj5r2s75q'
  },
  'software-development': {
    _id: '56744721958ef13879b94ad1',
    name: 'software development',
    slug: 'software-development'
  },
  business: { _id: '56744723958ef13879b952a1', name: 'business', slug: 'business' },
  java: { _id: '56744721958ef13879b94c9f', name: 'Java', slug: 'java' },
  'frontend-development': {
    _id: '56a399f292921b8f79d3633c',
    name: 'Frontend Development',
    slug: 'frontend-development'
  },
  linux: { _id: '56744721958ef13879b94b55', name: 'Linux', slug: 'linux' },
  github: { _id: '56744721958ef13879b94c63', name: 'GitHub', slug: 'github' },
  tutorial: { _id: '56744720958ef13879b947ce', name: 'Tutorial', slug: 'tutorial' },
  coding: { _id: '56744723958ef13879b954c1', name: 'coding', slug: 'coding' },
  learning: { _id: '56744723958ef13879b9532b', name: 'learning', slug: 'learning' },
  blockchain: {
    _id: '5690224191716a2d1dbadbc1',
    name: 'Blockchain',
    slug: 'blockchain'
  }
};

module.exports = { hashnodeTags };
