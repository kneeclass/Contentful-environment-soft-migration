const differ = require('../differ');
const inquirer = require('../inquirer')
const contentful = require('../contentful');
const chalk = require('chalk');

module.exports = {

    start: async (environments,credentials,args) => {

        let fromContentTypes = await contentful.getEnvironmentContentTypes(credentials,environments.from);    
        let toContentTypes = await contentful.getEnvironmentContentTypes(credentials, environments.to);    
        if(args.d || args.dump){
            console.log(chalk.magenta` -> Dumping content types diff <- \n`)
        }
        var contentTypeDiff = differ.findNewContentTypes(fromContentTypes,toContentTypes);
        if(contentTypeDiff.length > 0){
            let newContentTypes = await inquirer.askNewContentTypes(contentTypeDiff);
            if(newContentTypes.contentTypesToAdd.length > 0){

                for(var a = 0; a < newContentTypes.contentTypesToAdd.length; a++){

                    let contentType = contentTypeDiff.find(y => y.sys.id == newContentTypes.contentTypesToAdd[a]);
                    if(args.d || args.dump){
                        console.log("add:", contentType)
                    }
                    var type = await contentful.createContentType(credentials,contentType,environments.to);
                    console.log(chalk.green("Sucessfully migrated: "+type.name));
                }
            }
            else{
                console.log(chalk.cyanBright('No ContentTypes selected for migration'))
            }
        }
        else{
            console.log(chalk.cyanBright('Could not find any ContentTypes to migrate'))
        }

    }

}