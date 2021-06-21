import Peer from 'peerjs';
import React, { Component } from 'react';
import { Button } from 'reactstrap';
import io from "socket.io-client";
import { withRouter } from 'react-router';
import Subtitle from "./Subtitle.js";

import * as faceapi from 'face-api.js';

class Webcast extends Component {
    constructor(props) {
        super(props);
        this.myPeer = undefined;
        this.socket = undefined;
        this.main_peer_id = "";
        this.username  = "";
        this.myVideoStream = undefined;
        this.is_professor = false;
        this.textbox = undefined;
        this.transcript = undefined;
        this.participants = {};
        this.face_interval = undefined;
        this.sendsubtitle_interval = undefined;
        this.state = {
            detections: null,
            descriptors: null,
            facingMode: null
        };
        this.sendtext = this.sendtext.bind(this);
        this.trycall = this.trycall.bind(this);
        this.setpeeropen = this.setpeeropen.bind(this);
        this.exit = this.exit.bind(this);
        this.getTextbox = this.getTextbox.bind(this);
        this.sendsubtitle = this.sendsubtitle.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.swapscreen = this.swapscreen.bind(this);
        this.loadModels = this.loadModels.bind(this);
        this.capture = this.capture.bind(this);
        this.getFullFaceDescription = this.getFullFaceDescription.bind(this);
    }

    swapscreen() {
    }

    async loadModels() {
        const MODEL_URL = '/models';
        await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
        await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
    }

    async capture () {
        if (this.myVideoStream) {
        const myvideo = document.querySelector("#myvideo");
        const canvas = document.createElement('canvas');
        canvas.width = myvideo.videoWidth;
        canvas.height = myvideo.videoHeight;
        canvas.getContext('2d').drawImage(myvideo, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.8);
        
          await this.getFullFaceDescription(
            data,
            160
          ).then(fullDesc => {
            if (!!fullDesc) {
              this.setState({
                detections: fullDesc.map(fd => fd.detection),
              });
              //console.log("capture : ", this.state.detections);
              const participating = (this.state.detections.length != 0) ?
                "O": "X";
              console.log("participaitng : ", participating);
              const participants = document.querySelector("#participants_window");
              this.participants[this.username] = participating;
              this.socket.emit("send-participants", this.username, participating);
                participants.innerHTML = `<div class="message"> <span>Participants:</span></div>`
                for (var key in this.participants){
                    var value = this.participants[key];
                    participants.innerHTML = participants.innerHTML + `<div class="message"><span>${key}:${value}</span></div>`
                }
            }
          });
        }
    };

    async getFullFaceDescription(blob, inputSize = 512) {
        // tiny_face_detector options
        let scoreThreshold = 0.5;
        const OPTION = new faceapi.TinyFaceDetectorOptions({
          inputSize,
          scoreThreshold
        });
        const useTinyModel = true;
      
        // fetch image to api
        let img = await faceapi.fetchImage(blob);
      
        // detect all faces and generate full description from image
        // including landmark and descriptor of each face
        let fullDesc = await faceapi
          .detectAllFaces(img, OPTION)
          .withFaceLandmarks(useTinyModel)
          .withFaceDescriptors();
        return fullDesc;
    }

    sendsubtitle() {
        console.log("sending subtitle : ", this.textbox);
        if (this.textbox != undefined) {
            console.log("sending subtitle : ", this.textbox.innerHTML);
            this.socket.emit("subtitle", this.textbox.innerHTML);
        }
    }

    exit() {
        if (this.is_professor) {
            this.socket.emit("set_cur_main_id", "");
            this.socket.emit("Finish");
        }
        if (this.myPeer != undefined) {
            this.myPeer.disconnect();
        }
        if (this.socket != undefined) {
            this.socket.close();
        }
        this.props.history.push('/classes');
    }

    getTextbox() { 
        this.textbox = document.querySelector("#textbox");
        if (this.textbox == undefined) {
            setTimeout(() => this.getTextbox(), 1000);
        }
    }

    setpeeropen(sharevideo) {
        console.log("setpeeropen stream : ", this.myVideoStream);
        this.myPeer.on('open', (myid) => {
            const roomID = "defaultroomID";
            const userData = { userID : myid,  roomID : roomID };
            console.log('peers established and joined room', userData);
            this.socket.on("receive_main_id", (mainID) => {
                this.main_peer_id = mainID;
            })
            this.socket.emit('join-room', userData);
            if (!this.is_professor) {
                this.trycall(myid, sharevideo, 0);
            } else {
                this.socket.emit("set_cur_main_id", myid);
                this.myPeer.on('call', (call) => {
                    call.answer(this.myVideoStream);
                    call.on('error', () => {
                        console.log('peer error ------');
                    });
                });
            }
        });
    }

    trycall(myid, sharevideo, numtry) {        
        console.log("peer id : ", this.main_peer_id);
        console.log("myvideostream : ", this.myVideoStream);

        if (numtry >= 5 && (this.main_peer_id != "")) {
            const createEmptyAudioTrack = () => {
                const ctx = new AudioContext();
                const oscillator = ctx.createOscillator();
                const dst = oscillator.connect(ctx.createMediaStreamDestination());
                oscillator.start();
                const track = dst.stream.getAudioTracks()[0];
                return Object.assign(track, { enabled: false });
            };
              
            const createEmptyVideoTrack = ({ width, height }) => {
                const canvas = Object.assign(document.createElement('canvas'), { width, height });
                canvas.getContext('2d').fillRect(0, 0, width, height);
              
                const stream = canvas.captureStream();
                const track = stream.getVideoTracks()[0];
              
                return Object.assign(track, { enabled: false });
            };
              
            const audioTrack = createEmptyAudioTrack();
            const videoTrack = createEmptyVideoTrack({ width:640, height:480 });
            const mediaStream = new MediaStream([audioTrack, videoTrack]);
              
            const call = this.myPeer.call(this.main_peer_id, mediaStream, { metadata: { id: myid } });

            console.log("call : ", call);

            call.on('stream', (userVideoStream) => {
                sharevideo.srcObject = userVideoStream;
            });
            call.on('close', () => {
                console.log('closing call');
            });
            call.on('error', () => {
                console.log('peer error ------')
            });

        } else if ((this.main_peer_id == "") || (this.myVideoStream == undefined)) {
            console.log("waiting 1s...");
            setTimeout(() => this.trycall(myid, sharevideo, numtry + 1), 1000);
        } else {
            const call = this.myPeer.call(this.main_peer_id, this.myVideoStream, { metadata: { id: myid } });
    
            console.log("call : " , call);
            call.on('stream', (userVideoStream) => {
                sharevideo.srcObject = userVideoStream;
            });
            call.on('close', () => {
                console.log('closing call');
            });
            call.on('error', () => {
                console.log('peer error ------')
            })
        }
    }

    sendtext() {
        const chat_message = document.querySelector("#chat_message");
        if (chat_message.value.length !== 0) {
            this.socket.emit("message", chat_message.value, this.username);
            chat_message.value = "";
        }
    }

    handleKeyPress(e) {
        const chat_message = document.querySelector("#chat_message");
        if (e.key === "Enter" && chat_message.value.length !== 0) {
            this.socket.emit("message", chat_message.value, this.username);
            chat_message.value = "";
        }
    }

    componentDidMount() {
        this.myPeer = new Peer("", {host: "tester2.kaist.ac.kr", port : "4443"});

        this.socket = io("https://tester2.kaist.ac.kr:2443/", {
            secure: true,
            reconnection: true,
            rejectUnauthorized: false,
            reconnectionAttempts: 10
        });

        let peers = {};

        this.socket.on('connect', () => {
            console.log('socket connected');
        });
        this.socket.on('user-disconnected', (userID) => {
            console.log('user disconnected-- closing peers', userID);
        });
        this.socket.on('disconnect', () => {
            console.log('socket disconnected --');
        });
        this.socket.on('error', (err) => {
            console.log('socket error --', err);
        });

        this.is_professor = false;
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)===' ') c = c.substring(1,c.length);
            if (c.indexOf("usertype=") === 0) {
                if (c.substring(9) == "Professor") {
                    this.is_professor = true;
                }
            }
            if (c.indexOf("userid=") === 0) {
                this.username = c.substring(7);
            }
        }

        console.log("is professor ? : ", this.is_professor);
        const is_professor = this.is_professor;
        const myvideo = document.querySelector("#myvideo");
        const sharevideo = document.querySelector("#sharevideo");

        var temp_a = this;
        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio : true})
            .then(function (stream) {
                console.log("stream : ", stream);
                temp_a.myVideoStream = stream;
                myvideo.srcObject = stream;
                myvideo.addEventListener("loadedmetadata", () => {
                    myvideo.play();
                });
                if (is_professor) {
                    sharevideo.srcObject = stream;
                    sharevideo.addEventListener("loadedmetadata", () => {
                        sharevideo.play();
                    });
                }
            }, (reason) => {
                console.log("get user media rejected : ", reason);
            }).then(this.setpeeropen(sharevideo), (reason) => {
                console.log("get user media rejected 2 : ", reason);
            }).then(this.loadModels())
            .then(
                () => {
                    if (!temp_a.is_professor) {
                        temp_a.face_interval = setInterval(() => {
                            temp_a.capture();
                        },2000);
                    }
                }
            )
            .catch(function (err) {
                console.log("Something went wrong!: ", err);
            });
        }

        this.myPeer.on('error', (err) => {
            console.log('peer connection error', err);
            this.myPeer.reconnect();
        })

        const message_cont = document.querySelector("#message_cont");

        this.socket.on("createMessage", (message, userName) => {
            message_cont.innerHTML =
            message_cont.innerHTML +
            `<div class="message">
                <b><i class="far fa-user-circle"></i> <span> ${
                userName === this.username ? "me" : userName
                }</span> </b>
                <span>${message}</span>
            </div>`;
        });

        this.socket.on("getout", () => {
            this.exit();
        });

        if (!this.is_professor) {
            const textbox = document.querySelector("#textbox");
            this.socket.on("subtitlemessage", (message) => {
                textbox.innerHTML = message;
            });

            this.participants[this.username] = "O";
        } else {
            this.getTextbox();
            this.sendsubtitle_interval = setInterval(() => {
                this.sendsubtitle();
            }, 2000);
        }
        

        const participants = document.querySelector("#participants_window");
        this.socket.on("participants", (username, participating) => {
            this.participants[username] = participating;
            participants.innerHTML = `<div class="message"> <span>Participants:</span></div>`
            for (var key in this.participants){
                var value = this.participants[key];
                participants.innerHTML = participants.innerHTML + `<div class="message"><span>${key}:${value}</span></div>`
            }
        });
    }

    componentWillUnmount() { 
        if (this.face_interval != undefined) {
            clearInterval(this.face_interval);
            this.face_interval = undefined;
        }

        if (this.sendsubtitle_interval != undefined) {
            clearInterval(this.sendsubtitle_interval);
            this.sendsubtitle_interval = undefined;
        }
    }

    render() {
        this.is_professor = false;
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)===' ') c = c.substring(1,c.length);
            if (c.indexOf("usertype=") === 0) {
                if (c.substring(9) == "Professor") {
                    this.is_professor = true;
                }
            }
            if (c.indexOf("userid=") === 0) {
                this.username = c.substring(7);
            }
        }

        return (
            <div class="continer">
                <link rel="stylesheet" href="webcast.css" />
                <script type="text/javascript" src="https://kit.fontawesome.com/c939d0e917.js"></script>
                <div class="main">  
                    <div class="main__left">
                        <div id="sharevideo_cont">
                            <video autoplay="true" id = "sharevideo">
                            </video>
                        </div>
                        
                        <div class="options">
                            <div class="options__left">
                                <div id="subtitles">
                                    {(this.is_professor) ?
                                        <Subtitle /> : 
                                        <div id="textbox" class="temp" data-value="1"> </div>
                                    }
                                </div>
                            </div>
                            <div class="options__right">
                                {(this.is_professor) ?
                                <Button color="danger" onClick={this.exit}><i>Finish and Exit</i></Button> :
                                <Button color="danger" onClick={this.exit}><i>Exit</i></Button>}
                            </div>
                        </div>
                    </div>
                    <div class="main__right">
                        <div id="participants_window">
                            <div class="message">
                                <span>Participants:</span>
                            </div>
                        </div>
                        <div id="myvideo_cont">
                            <video autoplay="true" id = "myvideo">
                            </video>
                        </div>
                    </div>
                    <div class="main__right2">
                        <div class="main__chat_window" id ="message_cont">
                            <div class="messages">
                            </div>
                        </div>
                        <div class="main__message_container">
                            <input id="chat_message" type="text" autocomplete="off" placeholder="Type message here..." onKeyPress={this.handleKeyPress}/>
                            <Button color="primary" onClick={this.sendtext}><i class="fa fa-plus" aria-hidden="true"></i></Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Webcast);