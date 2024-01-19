const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

const taskModel = mongoose.model('tasks', taskSchema)

module.exports = taskModel