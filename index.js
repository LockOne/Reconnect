var express = require('express');
var app = express();
//var router = express.Router();
var cors = require('cors');
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json())

const https = require('https');
//const wss = require('wss');
const fs = require('fs');

const PORT = 2443;
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/chain.pem")
};

const path = require("path");
var controller_main = require("./server/login-controller");

/*
router.post("/login", async function(req,res){ 
    var result = await controller_main.SignIn(req,res); res.send(result);
});

// logout
router.get("/logout", function(req,res){
    console.log("clear cookie");
    res.clearCookie('userid');
    res.clearCookie('usertype');

    console.log("destroy session");
    req.session.destroy();
    res.sendFile(path.join(__dirname , "../public/login.html"));
});
*/
// regsiter
app.route("/register").post(async function (req,res) {
    //console.log("route accepted ", req.body);

    var result = await controller_main.SignUp(req, res);
    res.send(result);
});

app.use(function(req, res, next) {
    //console.log(req);
    res.status(404).send('Unable to find the requested resource!');
});
 

//app.use(router);

var https_server = https.createServer(options, app);
https_server.listen(PORT);

console.log("listening...");