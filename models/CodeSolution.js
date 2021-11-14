const mongoose = require('mongoose');

const CodeSolutionSchema = mongoose.Schema({
    questionID: {
        type: String,
        required: true,
    },
    jobID: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    output: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("codesolution", CodeSolutionSchema);