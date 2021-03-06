var express = require('express');
var app = express();
//var router = express.Router();
var cors = require('cors');

app.use(cors({
    origin : "https://tester2.kaist.ac.kr:3443",
    credentials: true,
  }));
 
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("view engine", "ejs");

var mongoose = require('mongoose');
const mongodbURL = ""//secret;
var option = {
    useNewUrlParser: true
  };
var db = mongoose.connect(mongodbURL, option).then(() => console.log("MongoDB Connected"))
      .catch((err) => console.log("there was erros on db connection"));

const https = require('https');
//const wss = require('wss');
const fs = require('fs');

const PORT = 2443;
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/chain.pem")
};

var peerserver = require("peer").PeerServer(
    {
        port : 4443,
        ssl : options
    });

var controller_main = require("./server/login-controller");

var Participate = require("./server/Participate");
var Class = require("./server/Class");

app.route("/login").post(async function(req,res){ 
    var result = await controller_main.SignIn(req, res);
    console.log("sending result : ", result);

    res.send(result);
});

// register
app.route("/register").post(async function (req,res) {
    //console.log("route accepted ", req.body);
    var result = await controller_main.SignUp(req, res);
    res.send(result);
});

app.route("/getclasses").post(async function (req,res) {
    let cursor = await Class.find({}).exec();
    var result = [];

    cursor.forEach(doc => {
        var tmp = {};
        tmp.id = doc.id;
        tmp.image = doc.image;
        tmp.description = doc.description;
        result.push(tmp);
    });    
    res.send(result);
});

var cur_main_peer_id = "";
app.route("/get_cur_id").post(async function (req,res) {
    res.send({res : cur_main_peer_id});
});


app.use(function(req, res, next) {
    //console.log(req);
    res.status(404).send('Unable to find the requested resource!');
});

//video streaming session
//Currently, only one webcast session can be connected

let connectedClients = [];

var https_server = https.createServer(options, app);

const io = require("socket.io")(https_server, {
    cors: {
      origin: '*'
    }
});


io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
            socket.join(roomId);
            //socket.to(roomId).broadcast.emit("user-connected", userId);
            
    });
});

io.on('connection', socket => {
    console.log('socket established')
    socket.on('join-room', (userData) => {
        const { roomID, userID } = userData;
        console.log("get userdata : ", userData);
        socket.join(roomID);
        console.log("sending main id : ", cur_main_peer_id);
        socket.emit("receive_main_id", cur_main_peer_id);
        socket.to(roomID).emit('new-user-connect', userData);
        socket.on('disconnect', () => {
            socket.to(roomID).emit('user-disconnected', userID);
        });

        //chat
        socket.on("message", (message, username) => {
            io.to(roomID).emit("createMessage", message, username);
        });

        socket.on("subtitle", (message) => {
            io.to(roomID).emit("subtitlemessage", message);
        });

        socket.on("Finish", () => {
            socket.to(roomID).emit("getout");
        });

        socket.on("send-participants", (username, participating) => {
            socket.to(roomID).emit("participants", username, participating);
        });

    });

    socket.on("set_cur_main_id", (peerid) => {
        console.log("setting main peer id : ", peerid);
        cur_main_peer_id = peerid;
    });
});



 

https_server.listen(PORT);

console.log("listening...");
