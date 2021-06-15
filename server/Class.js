const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    image : {type : String, required : true},
    description : {type : String, required: true},
});

var Class = mongoose.model('Class', ClassSchema);
module.exports = Class;