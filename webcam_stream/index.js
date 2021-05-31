var express = require('express');
var app = express();

const https = require('https');
const wss = require('wss');
const fs = require('fs');

const HTTPS_PORT = 2443;
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/cert.pem"),
    ca: fs.readFileSync("/etc/letsencrypt/live/tester2.kaist.ac.kr/chain.pem")
};

app.use('/public', express.static('public'));

app.get('/', function(req, res){
    res.sendFile('./index.html', {root: __dirname});
});

var https_server = https.createServer(options, app);

var	STREAM_PORT = 8082,
	WEBSOCKET_PORT =  8084;
    
var width = 640,
	height = 480;

let connectedClients = [];

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

https_server.listen(HTTPS_PORT);
