const Configstore = require('configstore');
const inquirer = require('./inquirer');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);
const {createClient} = require('contentful-management');

let client;

module.exports = {
  
  initClient: (token) => {
    client = createClient({
      accessToken: token
    });
  },

  getStoredContentfulToken: () => {
    return conf.get('contentful.token');
  },

  getStoredContentfulSpace: () => {
    return conf.get('contentful.space');
  },

  setContentfulCredentials: async (credentials) => {
    conf.set('contentful.token', credentials.token);
    conf.set('contentful.space', credentials.space);
    return credentials;
   },

   getEnvironments: async (credentials) => {
     let space = await client.getSpace(credentials.space);
     let environments = await space.getEnvironments();
     return environments;
  },

  getEnvironmentContentTypes: async (credentials, environment) => {

    let space = await client.getSpace(credentials.space);
    let env = await space.getEnvironment(environment);
    let contentTypes = await env.getContentTypes()
    return contentTypes;
  },

  getUiExtensions: async (credentials, environment) => {
    let space = await client.getSpace(credentials.space);
    let env = await space.getEnvironment(environment);
    let extensions = await env.getUiExtensions();
    return extensions;
  },

  createUiExension: async (credentials,environment,id,extension) => {

    let space = await client.getSpace(credentials.space);
    let env = await space.getEnvironment(environment);
    return await env.createUiExtensionWithId(id,{extension: extension});
  },

  updateUiExtension: async (credentials,environment,id,extension) => {
    let space = await client.getSpace(credentials.space);
    let env = await space.getEnvironment(environment);
    let currentExtension = await env.getUiExtension(id);
    currentExtension.extension = Object.assign(currentExtension.extension,extension)
    return await currentExtension.update();
  },

  createContentType: async (credentials, contentType,environment) => {
    let space = await client.getSpace(credentials.space);
    let env = await space.getEnvironment(environment);
    let createdContentType = await env.createContentTypeWithId(contentType.sys.id,{
      name: contentType.name,
      displayField: contentType.displayField,
      fields:contentType.fields
    })
    type = await env.getContentType(contentType.sys.id)
    await type.publish();
    return createdContentType;
  },
  createContentTypeFields: async (credentials,contentType,fields, environment, fieldDiffs) => {
    let space = await client.getSpace(credentials.space);
    let env = await space.getEnvironment(environment);
    let type = await env.getContentType(contentType.sys.id);
     let newFields = [...type.fields];
    fields.forEach(f => {
      var diff = fieldDiffs.find(x => f.id == x.id);
      if(diff.action == "add"){
        newFields.splice(diff.index,0,f);
      }
      else{
        newFields.splice(diff.index,1,f);
      }


    });
    
    type.fields = newFields;
    await type.update();
    type = await env.getContentType(contentType.sys.id)
    await type.publish();

    return type
  }
}
    

