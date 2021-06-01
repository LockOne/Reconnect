// login-service.js
var mongoose = require('mongoose');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var User = require("./User");

//login/signin
/*
exports.SignIn = async function(req){
    var json = {}; json.code = 0;
    var conn = await pool.getConnection();
    var userid = req.body.userid;
    var password = req.body.password;
    var query = "SELECT userid, password, salt, name FROM member where userid='" + userid +"' ;";

    console.log("trying to get queyr of ", query);
    var rows = await conn.query(query);

    if(rows[0]) {
        var userSalt = rows[0].salt;
        var userPass = rows[0].password;
        return new Promise((resolve, reject) =>{
            hasher({password:password, salt:userSalt},
                (err, pass, salt, hash) => {
                    if(hash != userPass) {
                        json.code = 100;
                        json.msg = "Wrong ID or password";
                        json.data = {};
                    } else {
                        json.data = rows[0];
                    }
                    
                    resolve(json);
                });
        });
    } else {
        json.code = 100;
        json.msg = "Wrong ID or password";
        json.data = {};
        return json;
    }
};
        */



// register/ signup
exports.SignUp = async function(req,res){

    let url =  ""; //secret 

    var option = {
        useNewUrlParser: true
      };

    var db = mongoose.connect(url, option).then(() => console.log("MongoDB Connected"))
      .catch((err) => console.log("there was erros on db connection"));

    console.log("testssss");

    var resultcode = 0;
    var userid = req.body.userid;
    var password = req.body.password;
    var usertype = req.body.usertype;

    //does not work now
    var exists = false;

    console.log("finding the user in db", userid, password, usertype);
    User.findOne({userid : userid}, function(err, user) {
        if (!user) {
            exists = true;
        }
    });

    console.log("user exists : ", exists);

    if (exists) {
        //already exists
        resultcode = 100;
    } else {
        User.create({userid : userid, password: password, usertype: usertype},
            function(err, user){
            if(err) {
                console.log("create error!", err);
            }
        });
    }
    return resultcode;
};
