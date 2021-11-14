const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

let codesDir = path.join(__dirname, '../codes')

if(!fs.existsSync(codesDir)){
    fs.mkdirSync(codesDir, {recursive: true})
}


const generateFile = async (code) => {
    const jobID = uuid();
    const fileName = `${jobID}.py`
    const filePath = path.join(codesDir, fileName);

    await fs.writeFileSync(filePath, code);
    return filePath;
}

module.exports = {
    generateFile,
}