// login-service.js
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var User = require("./User");

//login/signin

exports.SignIn = async function(req){
    var json = {}; json.code = 0;
    var userid = req.body.userid;
    var password = req.body.password;

    let findone = await User.findOne({userid : userid, password : password}).exec();

    console.log(findone);

    if (findone != null) {
        json.code = 0;
        json.userid = userid;
        json.usertype = findone.usertype;
        json.msg = "Login confirmed";
    } else {
        json.code = 100;
        json.msg = "Wrong ID or password";
    }

    console.log(json);

    return json;
};

// register/ signup
exports.SignUp = async function(req,res){
    
    var userid = req.body.userid;
    var password = req.body.password;
    var usertype = req.body.usertype;
    resultcode = 0;

    let findone = await User.findOne({userid : userid}).exec();

    console.log("find one : ", findone);

    if (findone === null) {
        User.create({userid : userid, password: password, usertype: usertype}, function(err, user) {
            console.log("err : ", err);
        });
    } else {
        resultcode = 100;
    }

    console.log("resultcode : ", resultcode);
    return resultcode;
};
