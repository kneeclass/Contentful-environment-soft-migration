const differ = require('../differ');
const inquirer = require('../inquirer')
const contentful = require('../contentful');
const chalk = require('chalk');

module.exports = {

    start: async (environments,credentials,args) => {
        
        let fromContentTypes = await contentful.getEnvironmentContentTypes(credentials,environments.from);    
        let toContentTypes = await contentful.getEnvironmentContentTypes(credentials, environments.to);    

        var contentTypeFieldDiff = differ.findNewFields(fromContentTypes,toContentTypes,args);

        if(Object.keys(contentTypeFieldDiff).length > 0){
            let newContentTypes = await inquirer.askNewContentTypeFields(contentTypeFieldDiff);
            if(newContentTypes.contentTypeFieldsToAdd.length > 0){

                for(var a = 0; a < newContentTypes.contentTypeFieldsToAdd.length; a++){
                    var contentType = fromContentTypes.items.find(y => y.sys.id == newContentTypes.contentTypeFieldsToAdd[a])
                    var fields = contentType.fields.filter(x => contentTypeFieldDiff[contentType.sys.id].some(y => x.id == y.id));
                    var fieldsDiffs = contentTypeFieldDiff[contentType.sys.id];
                    var type = await contentful.createContentTypeFields(credentials,contentType,fields,environments.to,fieldsDiffs)
                    console.log(chalk.green("Sucessfully migrated fields: "+type.name));
                }
            }
            else{
                console.log(chalk.cyanBright('No ContentType fields selected for migration'))
            }
        }
        else{
            console.log(chalk.cyanBright('No fields to migrate found'))
        }
    }
}