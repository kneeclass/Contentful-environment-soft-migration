#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const parseArgs = require('minimist')

const inquirer = require('./lib/inquirer')
const contentful = require('./lib/contentful');
const differ = require('./lib/differ');

clear();

console.log(chalk.yellow(figlet.textSync('CESM', { horizontalLayout: 'full' })));
console.log(chalk.green`Contentful environment soft migration`);
console.log(chalk.green`-------------------------------------`);
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

const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const credentials = await getContentfulCredentials();
    contentful.initClient(credentials.token)
    let environments = await contentful.getEnvironments(credentials);
    var selectedEnvironments = argsEnvironment() || await inquirer.askEnvironments(environments);    
    let fromContentTypes = await contentful.getEnvironmentContentTypes(credentials,selectedEnvironments.from);    
    let toContentTypes = await contentful.getEnvironmentContentTypes(credentials, selectedEnvironments.to);    
    

    /* Adding new ContentTypes */
    var contentTypeDiff = differ.findNewContentTypes(fromContentTypes,toContentTypes);
    if(contentTypeDiff.length > 0){
      let newContentTypes = await inquirer.askNewContentTypes(contentTypeDiff);
      if(newContentTypes.contentTypesToAdd.length > 0){
        newContentTypes.contentTypesToAdd.forEach(x => {
          let contentType = contentTypeDiff.find(y => y.sys.id == x);
          contentful.createContentType(credentials,contentType,selectedEnvironments.to);
        })
      }
      else{
        console.log(chalk.cyanBright('No ContentTypes selected for migration'))
      }
    }

    /* Adding new fields to ContentTypes */
    var contentTypeFieldDiff = differ.findNewFields(fromContentTypes,toContentTypes);
    if(Object.keys(contentTypeFieldDiff).length > 0){
      let newContentTypes = await inquirer.askNewContentTypeFields(contentTypeFieldDiff);
      if(newContentTypes.contentTypeFieldsToAdd.length > 0){
        
        newContentTypes.contentTypeFieldsToAdd.forEach(x => {
          var contentType = fromContentTypes.items.find(y => y.sys.id == x)
          var fields = contentTypeFieldDiff[contentType.sys.id];
          contentful.createContentTypeFields(credentials,contentType,fields,selectedEnvironments.to)
        })
      }
      else{
        console.log(chalk.cyanBright('No ContentType fields selected for migration'))
      }
    }
  } catch(err) {
    console.log(err);
  }
};

run();
