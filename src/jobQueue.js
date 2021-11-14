const Queue = require('bull');
const jobQueue = new Queue('job-queue');
const NUM_WORKERS = 5;
const { executePy } = require('./executePy');
const { executeQuestionFile } = require('./executeQuestionFile');
const Job = require('../models/Job');
const CodeSolution = require('../models/CodeSolution');

jobQueue.process(NUM_WORKERS, async ({data}) => {
    console.log(data);
    const {id: jobId, questionId, userEmail} = data;

    const job = await Job.findById(data.jobId);
    console.log("Job - ", job);
    if(job === undefined || job == null){
        throw Error('job not found');
    }
    console.log("Fetched Job", data.jobId, job);

    try{
        job["startedAt"] = new Date();

        let output;

        if(data.questionId === undefined || !data.questionId){
            console.log("Exec File", data.questionId, job.filePath);
            output = await executePy(job.filePath);
        } else {
            console.log("Exec Question File", data.questionId, job.filePath);
            output = await executeQuestionFile(job.filePath, data.questionId);

            try{
                let codeSolution = await new CodeSolution({questionId: questionId, jobId: data.jobId, userEmail: data.userEmail, timestamp: new Date(), output: output}).save();
            } catch(err){
                console.log("Error creating code solution document", err);
            }
        }

        console.log("Job Completed", output);
        job["completedAt"] = new Date();
        job["status"] = "success";
        job["output"] = output;

        await job.save();
        return true;
    } catch(err){
        job["completedAt"] = new Date();
        job["status"] = "error";
        job["output"] = JSON.stringify(err);

        console.log("Job Error:", err);
        await job.save();
    }
});

jobQueue.on('failed', (error) => {
    console.log(error.data.id, "failed", error.failedReason);
});

const addJobToQueue = async (jobId) => {
    await jobQueue.add(jobId);
}

module.exports = {
    addJobToQueue
}