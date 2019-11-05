
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

    findNewFields: (from,to) => {

        let foundFields = {};
        from.items.forEach((fromType,i) => {
            var toType = to.items.find(x => x.sys.id == fromType.sys.id);
            if(toType == null) return;
            
            fromType.fields.forEach((fromField,index) => {
                let toField = toType.fields.find(x => x.id == fromField.id);
                if(toField == null){
                    if(foundFields[fromType.sys.id] == null) {
                        foundFields[fromType.sys.id] = {};
                    }
                    foundFields[fromType.sys.id][index] = fromField 
                }
            
            });

        })
        return foundFields;

    }

}