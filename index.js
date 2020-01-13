#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const parseArgs = require('minimist')

const inquirer = require('./lib/inquirer')
const contentful = require('./lib/contentful');
const differ = require('./lib/differ');

const constants = require('./constants')

//actions
const addContentType = require('./lib/actions/addContentType')
const addFields = require('./lib/actions/addFields')
const addUiExtensions = require('./lib/actions/addUiExtensions')

clear();

console.log(chalk.yellow(figlet.textSync('CESM', { horizontalLayout: 'full' })));
console.log(chalk.green`Contentful environment soft migration`);
console.log(chalk.green`-----------------------------------------------`);
console.log();

const args = parseArgs(process.argv);

const argsEnvironment = () => {
  if(args.from && args.to){

    console.log(`Using from: ${args.from} and to: ${args.to} from args`)

    return {
      from:args.from,
      to:args.to
    }
  }
  return null;
}

const getContentfulCredentials = async () => {
  let credentials = null;
  let token = args.token || contentful.getStoredContentfulToken();
  let space = args.space || contentful.getStoredContentfulSpace();

  if(!token || !space){
    credentials = await inquirer.askContentfulToken();
    await contentful.setContentfulCredentials(credentials);
  }
  else{
    credentials = {
      token,
      space
    }
  }
  return credentials;
};

const askActionToPerform = async (selectedEnvironments,credentials) => {

  const selectedAction = await inquirer.askActionToPerform();

  switch(selectedAction.action){

    case constants.actions.addContentType:
      await addContentType.start(selectedEnvironments,credentials,args);
      break;
    case constants.actions.addFields:
      await addFields.start(selectedEnvironments,credentials,args);
      break;
    case constants.actions.addUiExtensions:
      await addUiExtensions.start(selectedEnvironments,credentials,args);
      break;

  }


}

const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const credentials = await getContentfulCredentials();
    contentful.initClient(credentials.token)
    let environments = await contentful.getEnvironments(credentials);
    var selectedEnvironments = argsEnvironment() || await inquirer.askEnvironments(environments);    

    while(true){
      console.log();
      await askActionToPerform(selectedEnvironments,credentials);
      console.log();
      console.log(chalk.green`-----------------------------------------------`);
    }
    
  } catch(err) {
    console.log(err);
  }
};

run();
