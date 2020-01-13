const differ = require('../differ');
const inquirer = require('../inquirer')
const contentful = require('../contentful');
const chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;

module.exports = {

    start: async (environments,credentials,args) => {

        var spinner = new Spinner(`Loading UI Extensions from ${environments.from}.. %s`);
        spinner.start();
        let extensionsFrom = await contentful.getUiExtensions(credentials,environments.from);
        spinner.setSpinnerTitle(`Loading UI Extensions from ${environments.to}.. %s`)
        let extensionsTo = await contentful.getUiExtensions(credentials,environments.to);
        spinner.stop(true);
        var newOrChanged = differ.findNewOrChangedUiExtensions(extensionsFrom,extensionsTo,args);
        console.log()

        if(newOrChanged.length == 0){
            console.log(chalk.cyanBright('No UI Extensions to migrate found'));
            return;
        }
        var selectedUiExtensions = await inquirer.askNewUiExtensions(newOrChanged);

        if(selectedUiExtensions.uiExtensionsToAdd.length == 0){
            console.log(chalk.cyanBright('No UI Extensions selected for migration'));
            return;
        }
        let extensionsToMigrate = extensionsFrom.items.filter(x => selectedUiExtensions.uiExtensionsToAdd.some(y => y == x.sys.id));

        spinner.setSpinnerTitle(`Uploading extensions.. %s`)
        spinner.start()
        for(var a = 0; a < extensionsToMigrate.length; a++){
            spinner.setSpinnerTitle(`Uploading extension ${extensionsToMigrate[a].sys.id}.. %s`)

            //new
            if(newOrChanged.some(x => x.id == extensionsToMigrate[a].sys.id && x.action == "new")){
                await contentful.createUiExension(credentials,
                    environments.to, extensionsToMigrate[a].sys.id, extensionsToMigrate[a].extension
                );
            }
            //update
            else{
                await contentful.updateUiExtension(credentials,
                    environments.to, extensionsToMigrate[a].sys.id, extensionsToMigrate[a].extension
                );
            }
            
        }
        spinner.stop(true);
        console.log(chalk.green("Sucessfully migrated extensions"));

    }

}
