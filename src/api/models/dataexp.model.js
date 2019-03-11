const mongoose = require('mongoose');


const dataexpSchema = new mongoose.Schema({
    skip: Number,
    limit: Number,
    timeperiod: "",
    signalpath:"",
    pageNum:Number,
    userID:"",
    sessionID:"",
    resource:""
});

dataexpSchema.method({
    transform() {
        const transformed = {};
        const fields = ['skip', 'limit','timeperiod','signalpath','pageNum','userID','sessionID','resource'];

        fields.forEach((field) => {
            transformed[field] = this[field];
        });

        return transformed;
    },
});

module.exports = mongoose.model('DataExpSchema', dataexpSchema);