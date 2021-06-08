var express = require('express');
var app = express();
//var router = express.Router();
var cors = require('cors');
app.use(cors({
    origin : "https://tester2.kaist.ac.kr:1443",
    credentials: true,
  }));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

var mongoose = require('mongoose');
const mongodbURL = "" //secret;
var option = {
    useNewUrlParser: true
  };
var db = mongoose.connect(mongodbURL, option).then(() => console.log("MongoDB Connected"))
      .catch((err) => console.log("there was erros on db connection"));

const https = require('https');
const wss = require('wss');
const fs = require('fs');

const PORT = 2443;
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/chain.pem")
};

const path = require("path");
var controller_main = require("./server/login-controller");

var Participate = require("./server/Participate");

app.route("/removeallpart").post(async function(req, res) {
    var result = await Participate.deleteMany({}).exec();
    console.log("removed ", result.deletedCount);
});

app.route("/updategaze").post(async function(req,res){ 
    
    var userid = req.body.userid;
    var participating = req.body.participating;

    let findone = await Participate.findOne({userid : userid}).exec();

    if (findone != null) {
        Participate.updateOne({userid : userid}, {userid : userid, participating : participating})
        .then(result => {
            const { matchedCount, modifiedCount } = result;
            if(matchedCount && modifiedCount) {
                console.log(`Successfully added a new review.`)
            }
        })
        .catch(err => console.error(`Failed to add review: ${err}`))
    } else {
        Participate.create({userid : userid, participating : participating},
            function(err, user) {
                console.log("err : ", err);
        });
    }
});

app.route("/getgaze").post(async function(req,res){ 
    let cursor = await Participate.find({}).exec();
    var result = {};
    result.data = [];

    cursor.forEach(doc => {
        var tmp = {};
        tmp.userid = doc.userid;
        tmp.participating = doc.participating;
        result.data.push(tmp);
    });

    console.log("result : ", result);
    
    res.send(result);
});

app.route("/login").post(async function(req,res){ 
    var result = await controller_main.SignIn(req, res);
    console.log("sending result : ", result);

    res.send(result);
    res.redirect("/classes");
});

// logout
app.get("/logout", function(req,res){
    console.log("clear cookie");
    res.clearCookie('userid');
    res.clearCookie('usertype');

    console.log("destroy session");
    //req.session.destroy();
    //res.sendFile(path.join(__dirname , "../public/login.html"));
});

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

let connectedClients = [];

var https_server = https.createServer(options, app);

var socketServer = wss.createServerFrom(https_server, function connectionListener (ws) {

    console.log("connected");

    var streamer_connected = false;

    let first_listener = (data) => {
        if (!streamer_connected && data == 1) {
            console.log("streamer");
            ws.removeEventListener('message', first_listener);
            ws.on('message', (data) => {
                //console.log("message taken.");
                connectedClients.forEach((wsss, i) => {
                    if (wsss.readyState === wsss.OPEN) {
                        //console.log("message sent");
                        wsss.send(data);
                    } else {
                        connectedClients.splice(i, 1);
                    }
                });
            });
        } else if (streamer_connected && data == 1) {
            ws.close();
        } else {
            console.log("client");
            connectedClients.push(ws);
        }
    }

    ws.on('message', first_listener);
    
    ws.on("error", function(event) {
        console.log("stream: Server error, ", event.data);
    });
});
 

https_server.listen(PORT);

console.log("listening...");
