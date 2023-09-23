#! /usr/bin/env node
const path = require('path');
const { program } = require('commander');
const run = require('./src/run');

const ALLOWED_PLATFORMS = ['dev.to', 'hashnode', 'medium'];
program.usage('[command] [options]');

program
  .command('run <url>')
  .description('Cross post a blog post')
  .option(
    '-cnu, --canonical-url [canonicalUrl]',
    'Original url the article was published first. It is mandatory for SEO'
  )
  .option('-t, --title [title]', 'Title for the article')
  .option('-iu, --image-url [imageUrl]', "URL of image to use for the article's main image.")
  .option(
    '-p, --platforms [platforms...]',
    `Platforms to post articles to. Allowed values are: ${ALLOWED_PLATFORMS}
    )}`
  )
  .option('-pu, --publish', 'Publish to the platform. Default: draft.')

  .action(run);

program
  .command('config')
  .description(`Add configuration for a platform or other options. Allowed values are: ${ALLOWED_PLATFORMS}`)
  .executableDir(path.join(__dirname, './src/config'))
  .command('dev', 'configure for dev.to platform')
  .command('medium', 'configure for medium.com platform')
  .command('hashnode', 'configure for hashnode.com platform')
  .command('reset', 'reset configuration for a given platform(s)');

program.parse();
