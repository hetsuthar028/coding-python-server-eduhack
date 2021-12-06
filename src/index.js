const express = require('express');
const cors = require('cors');
require('dotenv');
const { generateFile } = require('./generateFile');
const mongoose = require('mongoose');
const { executePy } = require('./executePy');
const Job = require('../models/Job');
const { addJobToQueue } = require('./jobQueue');

const PORT = process.env.SERVER_PORT || 10300;
let paths = {
    "runCode": '/api/code/server/python/run',
    "statusCheck": '/api/code/server/status/:jobId'
}

mongoose.connect('mongodb://localhost/eduhack-coding-service', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if(err){
        console.log(err);
        process.exit(1);
    }
    console.log("Successfully connected to Mongodb Database");
})


const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

let language = 'py';

app.get(`${paths["statusCheck"]}`, async (req, res) => {
    const jobId = req.params.jobId;
    console.log("Status Requested", jobId);

    if(jobId === undefined){
        return res.status(400).json({success: false, error: "Missind id in params"});
    }

    console.log(jobId);
    try{
        const job = await Job.findById(jobId);

        if(job === undefined){
            return res.status(404).json({success: false, error: "Invalid job id"});
        }
        return res.status(200).json({success: true, job});
    } catch(err){
        return res.status(400).json({success: false, error: JSON.stringify(err)});
    }
})

app.post(`${paths['runCode']}`, async (req, res) => {
    let { language = 'python', content, userEmail, questionId } = req.body;
    console.log("PYTHON SERVER Got Question", questionId);
    let job;

    try{
        const filePath = await generateFile(content);
        
        job = await new Job({language, filePath}).save();

        const jobId = job["_id"];
        console.log(job);
        addJobToQueue({jobId, questionId, filePath});
        res.status(200).json({success: true, jobId});

    } catch(err){
        console.log("Error occured", err);
        return res.status(500).json({success: false, err: JSON.stringify(err)});
    }
})

app.listen(PORT, () => {
    console.log(`Code Editor - Python server running on ${PORT}`);
})