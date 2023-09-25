#! /usr/bin/env node
const { program } = require('commander');
const run = require('./src/run');
const { reset } = require('./src/config/reset');
const { setkey } = require('./src/config/setk');

const ALLOWED_PLATFORMS = ['dev.to', 'hashnode', 'medium'];

program.usage('[command] [options]');

program.command('clear').description(`Resets all keys.`).action(reset);
program

  .command('setk')
  .argument('<platform>', 'Configure key for hashnode.com | medium.com | dev.to  platforms')
  .description(`Add configuration for a platfor. Allowed values are: ${ALLOWED_PLATFORMS}`)
  .action(setkey);

program
  .argument('<url>')
  .description('Crossposting articles everywhere')
  .option(
    '-c, --canonical-url [canonicalUrl]',
    'Original url the article was published first. It is mandatory for SEO'
  )
  .option('-t, --title <title>', 'Title for the article')
  .option('-tg, --tags <tags...>', 'Tags for the article')
  .option('-i, --image-url <imageUrl>', "URL of image to use for the article's main image.")
  .option('-si, --skip-image', 'Skip image main cover.')
  .option(
    '-p, --platforms [platforms...]',
    `Platforms to post articles to. Allowed values are: ${ALLOWED_PLATFORMS}`
  )
  .option('-pu, --publish', 'Publish to the platform. Default: draft.')
  .action(run);

program.parse();
