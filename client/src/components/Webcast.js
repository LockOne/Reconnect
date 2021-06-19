import Peer from 'peerjs';
import React, { Component } from 'react';
import { Button } from 'reactstrap';
import io from "socket.io-client";

class Webcast extends Component {
    constructor(props) {
        super(props);
        this.myPeer = undefined;
        this.socket = undefined;
        this.main_peer_id = "";
        this.streaming = false;
        this.username  = "";
        this.myVideoStream = undefined;
        this.is_professor = false;
        this.sendtext = this.sendtext.bind(this);
        this.trycall = this.trycall.bind(this);
        this.setpeeropen = this.setpeeropen.bind(this);
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
                this.trycall(myid, sharevideo);
            } else {
                this.socket.emit("opened-room", myid);
                this.myPeer.on('call', (call) => {
                    call.answer(this.myVideoStream);
                    call.on('error', () => {
                        console.log('peer error ------');
                    });
                });
            }
        });
    }

    trycall(myid, sharevideo) {        
        console.log("peer id : ", this.main_peer_id);
        console.log("myvideostream : ", this.myVideoStream);
        if ((this.main_peer_id == "") || (this.myVideoStream == undefined)) {
            console.log("waiting 1s...");
            setTimeout(() => this.trycall(myid, sharevideo), 1000);
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
            }).then(this.setpeeropen(sharevideo))
            .catch(function (err) {
                console.log("Something went wrong!: ", err);
            });
        }

        this.myPeer.on('error', (err) => {
            console.log('peer connection error', err);
            this.myPeer.reconnect();
        })
/*
        const text = document.querySelector("#text");
        text.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && text.value.length !== 0) {
            this.socket.emit("message", text.value);
            text.value = "";
        }
        });*/

        const message_cont = document.querySelector("#meesage_cont");

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

    }

    render() {
        return (
            <div class="continer">
                <link rel="stylesheet" href="webcast.css" />
                <script type="text/javascript" src="https://kit.fontawesome.com/c939d0e917.js"></script>
                <script type="text/javascript" src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></script> 
                <div class="main">  
                    <div class="main__left">
                        <div id="sharevideo_cont">
                            <video autoplay="true" id = "sharevideo">
                            </video>
                        </div>
                        <div class="options">
                            <div class="options__left">
                                <div id="stopVideo" class="options__button">
                                    <i class="fa fa-video-camera"></i>
                                </div>
                                <div id="muteButton" class="options__button">
                                    <i class="fa fa-microphone"></i>
                                </div>
                                <div id="showChat" class="options__button">
                                    <i class="fa fa-comment"></i>
                                </div>
                            </div>
                            <div class="options__right">
                                <div id="exitButton" class="options__button">
                                    <i class="fas fa-user-plus">Exit</i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="main__right">
                        <div id="participants"></div>
                        <div id="myvideo_cont">
                            <video autoplay="true" id = "myvideo">
                            </video>
                        </div>
                    </div>
                    <div class="main__right2">
                        <div class="main__chat_window" id ="meesage_cont">
                            <div class="messages">
                            </div>
                        </div>
                        <div class="main__message_container">
                            <input id="chat_message" type="text" autocomplete="off" placeholder="Type message here..."/>
                            <Button color="primary" onClick={this.sendtext}><i class="fa fa-plus" aria-hidden="true"></i></Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Webcast;