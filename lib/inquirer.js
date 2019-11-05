const inquirer = require('inquirer');
 
module.exports = {
  
  askContentfulToken: () => {
    const questions = [
      {
        name: 'token',
        type: 'input',
        message: 'Enter your Contentful token:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your token.';
          }
        }
      },
      {
        name: 'space',
        type: 'input',
        message: 'Enter your space id:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your space id';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  askEnvironments: async (environments) => {

    let fromAnswer = await inquirer.prompt([ {
      type: 'list',
      name: 'fromEnvironment',
      message: 'Migrate from environment',
      choices: environments.items.map(x => x.sys.id),
    }]);
    console.log()
    let toAnswer = await inquirer.prompt([ {
      type: 'list',
      name: 'toEnvironment',
      message: 'Migrate to environment',
      choices: environments.items.filter(x => x.name != fromAnswer.fromEnvironment).map(x => x.sys.id),
    }]);

    return {
      from: fromAnswer.fromEnvironment,
      to: toAnswer.toEnvironment
    }
    
  },

  askNewContentTypes: (newContentTypes) => {
    console.log()
    var names = newContentTypes.map(x => {
      return {
        name: `${x.name} (${x.sys.id})`,
        value: x.sys.id
      };
    })

    const questions = [
      {
        type: 'checkbox',
        name: 'contentTypesToAdd',
        message: 'Select ContentTypes you wish to migrate:',
        choices: names,
        pageSize: 25
      }
    ];
    return inquirer.prompt(questions);
  },

  askNewContentTypeFields: (newContentTypeFields) => {
    console.log()
    var names = Object.keys(newContentTypeFields).map(x => {
      var fields = Object.values(newContentTypeFields[x]);
      var names = fields.map(x => x.id)

      return {
        name: `${x} (${names.join(', ')})`,
        value: x
      };
    })
    const questions = [
      {
        type: 'checkbox',
        name: 'contentTypeFieldsToAdd',
        message: 'Select new ContentTypes fields you wish to migrate:',
        choices: names,
        pageSize: 25
      }
    ];
    return inquirer.prompt(questions);
  }
};
