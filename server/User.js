const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    userid: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    usertype :{ type: String, required: true },
});

var User = mongoose.model('User', UserSchema);
module.exports = User;