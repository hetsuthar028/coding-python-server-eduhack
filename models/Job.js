const mongoose = require('mongoose');

const JobSchema = mongoose.Schema({
    language: {
        type: String,
        required: true,
        enum: ['js', 'python', 'c', 'c++', 'java']
    },
    filePath: {
        type: String,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    startedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    output: {
        type: String,
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "success", "error"]
    }
});

module.exports = mongoose.model("job", JobSchema);