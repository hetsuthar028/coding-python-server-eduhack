const path = require('path');
const fs = require('fs');
const { exec } = require('child_process')

const executePy = async (filePath) => {

    const jobID = path.basename(filePath).split(".")[0]
    console.log("File Path in ExecutePy", filePath);

    return new Promise((resolve, reject) => {
        exec(`python ${filePath}`, 
            (error, stdout, stderr) => {
                error && reject({error, stderr});
                stderr && reject({stderr});
                resolve(stdout)
            })
    })
}

module.exports = {
    executePy,
}