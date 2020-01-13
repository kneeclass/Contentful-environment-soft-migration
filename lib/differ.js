
const { diff } = require("deep-object-diff");
const chalk = require('chalk');

module.exports = {

    findNewContentTypes: (from, to) => {
        let notFoundInTo = [];
        from.items.forEach(fromType => {
            var foundInTo = to.items.some(x => x.sys.id == fromType.sys.id)
            if(!foundInTo)
                notFoundInTo.push(fromType);
        })
        return notFoundInTo;
    },

    findNewFields: (from,to,args) => {

        if(args.d || args.dump){
            console.log(chalk.magenta` -> Dumping field diff <- \n`)
        }
        let foundFields = {};
        from.items.forEach((fromType,i) => {
            var toType = to.items.find(x => x.sys.id == fromType.sys.id);
            if(toType == null) return;
            fromType.fields.forEach((fromField,index) => {
                let toField = toType.fields.find(x => x.id == fromField.id);
                if(toField == null){
                    if(foundFields[fromType.sys.id] == null) {
                        foundFields[fromType.sys.id] = [];
                    }
                    if(args.d || args.dump){
                        console.log(`add: ${fromType.sys.id} ${fromField.id} index: ${index}`)
                    }
                    foundFields[fromType.sys.id].push({
                        id: fromField.id,
                        action: "add",
                        index: index
                    });
                }
                let fieldDiff = diff(toField,fromField);
                if(fieldDiff != null && Object.keys(fieldDiff).length !== 0){
                    if(args.d || args.dump){
                        console.log("change: "+ fromType.sys.id +" "+ fromField.id,fieldDiff)
                    }
                    if(foundFields[fromType.sys.id] == null) {
                        foundFields[fromType.sys.id] = [];
                    }
                    foundFields[fromType.sys.id].push({
                        id: fromField.id,
                        action: "update",
                        index: index
                    });
                        
                }

            
            });

        })
        if(args.d || args.dump){
            console.log()
        }
        return foundFields;
    },

    findNewOrChangedUiExtensions: (from,to,args) => {
        
        let foundExtensions = [];
        
        if(args.d || args.dump){
            console.log(chalk.magenta` -> Dumping Ui Extensions diff <- \n`)
        }

        from.items.forEach((fromExtension) => {
            let toExtension = to.items.find(x => x.sys.id == fromExtension.sys.id);

            if(toExtension == null) {
                if(args.d || args.dump){
                    var json = JSON.stringify(fromExtension);
                    let deepClone = JSON.parse(json);
                    deepClone.extension.srcdoc = "! Excluded in dump !";
                    console.log("add:",deepClone);
                    
                }
                foundExtensions.push({
                    id: fromExtension.sys.id,
                    name: fromExtension.extension.name,
                    action: "new"
                });
                return;
            }

            if(fromExtension.sys.srcdocSha256 != toExtension.sys.srcdocSha256) {

                if(args.d || args.dump){
                    console.log(`change: ${fromExtension.sys.id} srcdocSha256 diff:`,{
                        from: fromExtension.sys.srcdocSha256,
                        to: toExtension.sys.srcdocSha256
                    });   
                }

                foundExtensions.push({
                    id: fromExtension.sys.id,
                    name: fromExtension.extension.name,
                    action: "change"

                });
                return;
            }
        })
        return foundExtensions;

    }

}