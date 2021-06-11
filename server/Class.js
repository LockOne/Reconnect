const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    category :{ type: String, required: true },
    label: {type : String, required: true},
    price: {type : String, required: true},
    description : {type : String, required: true},
});

var Class = mongoose.model('User', ClassSchema);
module.exports = Class;