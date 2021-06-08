const mongoose = require('mongoose');


const ParticipateSchema = new mongoose.Schema({
    userid: { type: String, unique: true, required: true },
    participating :{ type: String, required: true },
});

var Participate = mongoose.model('Participate', ParticipateSchema);
module.exports = Participate;