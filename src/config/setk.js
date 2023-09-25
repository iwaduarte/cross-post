const inquirer = require('inquirer');
const { displayInfo, displayError } = require('../utils');
const { config: configDev } = require('./dev');
const { config: configHashnode } = require('./hashnode');
const { config: configMedium } = require('./medium');

const promptMap = {
  dev: [
    [
      {
        name: 'apiKey',
        message: displayInfo('Enter dev.to API key')
      }
    ],
    configDev
  ],
  hashnode: [
    [
      {
        name: 'apiKey',
        message: displayInfo('Enter hashnode.com API key')
      },
      {
        name: 'username',
        message: displayInfo('Enter username to get publication ID')
      }
    ],
    configHashnode
  ],
  medium: [
    [
      {
        name: 'integrationToken',
        message: displayInfo('Enter medium.com Integration Token')
      }
    ],
    configMedium
  ]
};

const setkey = async platform => {
  const [inquire, config] = promptMap[platform] || [];
  if (!inquire) return console.log(displayError(`Invalid platform  - ${platform}. Please try again.`));

  const responses = await inquirer.prompt(inquire);
  await config(responses);
};

module.exports = { setkey };
