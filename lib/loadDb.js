let XLSX = require('xlsx');
var fs = require('fs');


let fields = ['Name', 'Number', 'Email', 'Company', 'Group', 'OptIn']

const ec = (r, c) => {
    return XLSX.utils.encode_cell({r:r,c:c});
};




const splitContentRanges = (ws) => {
    let range = XLSX.utils.decode_range(ws["!ref"]);

    let cRows = []
    const end = range.e.r;

    for(var R = range.s.r; R <= range.e.r; ++R){ 

        for(var C = range.s.c; C <= range.e.c; ++C){
           if(ws[ec(R, C)] && (ws[ec(R, C)].w.toLowerCase().includes('contact details') || ws[ec(R, C)].w.toLowerCase().includes('contact list'))) {

            let index = ws[ec(R, C)].w.toLowerCase().indexOf('contact')
            let group = ws[ec(R, C)].w.toLowerCase().substr(0, index)

            if(cRows.length > 0) {
          
                cRows[cRows.length -1].end.r = R;

                cRows.push({start: {c:0, r: R+1}, end: {c:13,r:end}, group: group});

            } else {
                cRows.push({start: {c:0, r: R+1},  end: {c:13,r:end}, group: group});
             }

           }
        }
        
    }

    return cRows;
};

function getFilterSheet(jsonSheets, groupHeader) {
    let mergedSheet = [];


    for (let j = 0; j < jsonSheets.length; j++) {
        let formatJsonSheet = [];

        jsonSheets[j].map(row=> {

            let newWordsObject = {};
            let groupPair = { group: groupHeader[j].trim() };
            let optInPair = { optIn : true}
    
    
            Object.keys(row).forEach(key => {
                let newKey = key;
    
                switch (key) {
                    case 'COMPANY NAME':
                    case 'Company':
                        newKey = 'company'
                        break;
                    case 'CONTACT NO 1' || 'Tel':
                    case 'Tel':
                        newKey = 'number'
                        break;
                    case 'CONTACT NO 2':
                    case 'Cell':
                        newKey = 'number2'
                        break;
                    case 'CONTACT PERSON.':
                    case 'Contact Person':
                        newKey = 'name'
                        break;
                    case 'COMPANY E-MAIL':
                    case 'Email Adress':
                        newKey = 'email'
                        break;       
                    default:
                        delete row[key]
                        break;
                } 
                
                if(newKey == 'number' || newKey == 'number2') {
                  
                    row[key] = row[key].replace(/\s+/g,'')
    
                    if(row[key].substr(0, 3) == '012') {
                        return;
                    } else {
                        if(!Object.keys(newWordsObject).includes('number') && newKey == 'number2') {
                            newKey = 'number'
                        }
                    }
                }
    
                if(newKey != key) {
    
                    let newPair = { [newKey]: row[key].trim() };
                    newWordsObject = { ...newWordsObject, ...newPair }
                }
    
            });

            if(Object.keys(newWordsObject).includes('number')) {

                newWordsObject = {...newWordsObject, ...groupPair, ...optInPair}
    
                formatJsonSheet.push(newWordsObject)
            }
                
        })

        mergedSheet.push(formatJsonSheet)
        
    }

    mergedSheet = mergedSheet.flat(1)

    return mergedSheet;
}


try {

    var workbook = XLSX.readFile(__dirname + '\\list.xlsx');
    let sheet = workbook.Sheets['HATFIELD BUSINESSES'];


    let contentGroup = splitContentRanges(sheet);

    let groupJson = [], groupHeader = []

    for (let i = 0; i < contentGroup.length; i++) {

        let range = XLSX.utils.encode_range(contentGroup[i].start, contentGroup[i].end)

        groupHeader.push(contentGroup[i].group);
        
        let contentOptions = {
            blankrows : false,
            range: range
         }

         groupJson.push(XLSX.utils.sheet_to_json(sheet, contentOptions)) 

    }


    let finalSheet = getFilterSheet(groupJson, groupHeader)

    let jsonString = JSON.stringify(finalSheet)



    fs.writeFileSync('./list.json',jsonString, (err)=> {
        if (err) return console.log(err);
    })


    module.exports =  jsonString;
  
} catch (error) {
    console.log(error)
}


