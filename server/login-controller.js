var service_main = require("./login-service");

//login/signin
exports.SignIn = async function(req,res){
    //console.log( req.body);
    var result = await service_main.SignIn(req);
    return result;
};

// register
exports.SignUp = async function(req,res){
    console.log("sign up in login-controller.js");

    var result = await service_main.SignUp(req, res);
    var msg = "register done";
    if(result == 100) { msg = "userid already exists"; }
    var json = {code:result, msg:msg};
    console.log(json);
    return json;
};
