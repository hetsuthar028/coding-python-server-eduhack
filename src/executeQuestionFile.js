const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');



const executeQuestionFile = async (filePath, questionId) => {
    return new Promise(async (resolve, reject) => {
        console.log("Question Id in Exec", questionId);
        await axios.get(`http://localhost:9200/api/coding/get/question?id=${questionId}`)
            .then(async (response) => {
                console.log("Question -- ", response.data.questionData[0]);

                let { testCases, functionName } = response.data.questionData[0];

                let codeToAppend = `
import json
testCasesResults = []

def runTestCase(testCase):
    output = ${functionName}(*testCase["parameters"])
    
    if json.dumps(output) == json.dumps(testCase["output"]):
        respDict = dict()
        respDict["success"] = True
        respDict["programOutput"] = output
        testCasesResults.append(respDict)
    else:
        respDict = dict()
        respDict["success"] = False
        respDict["programOutput"] = output
        respDict["expectedOutput"] = testCase["output"]
        testCasesResults.append(respDict)

if __name__ == "__main__":
    testCases = ${JSON.stringify(testCases)}

    for i in testCases:
        runTestCase(i)

    print(testCasesResults)

`;

                try{
                    await fs.appendFileSync(filePath, codeToAppend);
                } catch(err){
                    console.log("Error while appending", err);
                    return reject({success: false, error: "Error appending prebuilt content!"})
                }

                exec(`python ${filePath}`, 
                    (error, stdout, stderr) => {
                        error && reject({error, stderr})
                        stderr && reject({stderr})
                        resolve(stdout)
                    })
            }).catch((err) => {
                console.log("Error Exe Question", err);
                return reject({err});
            })

    })
}

module.exports = {
    executeQuestionFile
}