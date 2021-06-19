import Peer from 'peerjs';
import React, { Component } from 'react';
import io from "socket.io-client";

class Webcast extends Component {
    constructor(props) {
        super(props);
        this.shareVideo = React.createRef();
        this.text = React.createRef();
        this.send = React.createRef();
        this.messages = React.createRef();
        this.myPeer = undefined;
        this.socket = undefined;
        this.trycall = this.trycall.bind(this);
        this.main_peer_id = "";
        this.streaming = false;
        this.username  = "";
        this.userData = undefined;
    }

    trycall(myVideoStream, myid, sharevideo) {        
        console.log("mainid : ", this.main_peer_id);
        console.log("mystream : ", myVideoStream);
        if (this.main_peer_id == "") {
            console.log("waiting 1s...");
            setTimeout(() => this.trycall(myVideoStream, myid, sharevideo), 1000);
        } else {
            const call = this.myPeer.call(this.main_peer_id, myVideoStream, { metadata: { id: myid } });
    
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
            peers[userID] && peers[userID].close();
        });
        this.socket.on('disconnect', () => {
            console.log('socket disconnected --');
        });
        this.socket.on('error', (err) => {
            console.log('socket error --', err);
        });

        let myVideoStream;

        var is_prefessor = false; //webcast open or webcast join
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)===' ') c = c.substring(1,c.length);
            if (c.indexOf("usertype=") === 0) {
                if (c.substring(9) == "Professor") {
                    is_prefessor = true;
                }
            }
            if (c.indexOf("userid=") === 0) {
                this.username = c.substring(7);
            }
        }

        console.log("is professor ? : ", is_prefessor);
        const myvideo = document.querySelector("#myvideo");
        const sharevideo = document.querySelector("#sharevideo");
        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio : true})
            .then(function (stream) {
                myVideoStream = stream;
                console.log("trying setting myvideo");
                myvideo.srcObject = stream;
                myvideo.addEventListener("loadedmetadata", () => {
                    myvideo.play();
                });
                console.log("myvideo set");
                if (is_prefessor) {
                    sharevideo.srcObject = stream;
                    sharevideo.addEventListener("loadedmetadata", () => {
                        sharevideo.play();
                    });
                }
            })
            .catch(function (err) {
                console.log("Something went wrong!");
            });
        }

        this.myPeer.on('open', (myid) => {
            const roomID = "defaultroomID";
            this.userData = { userID : myid,  roomID : roomID };
            console.log('peers established and joined room', this.userData);
            this.socket.on("receive_main_id", (mainID) => {
                console.log("mainid received : ", mainID);
                this.main_peer_id = mainID;
            })
            this.socket.emit('join-room', this.userData);
            if (!is_prefessor) {
                this.trycall(myVideoStream, myid, sharevideo);
            } else {
                this.socket.emit("opened-room", myid);
                this.myPeer.on('call', (call) => {
                    call.answer(myVideoStream);
                    call.on('error', () => {
                        console.log('peer error ------');
                    });
                    //peers[call.metadata.id] = call;
                });
            }
        });

        this.myPeer.on('error', (err) => {
            console.log('peer connection error', err);
            this.myPeer.reconnect();
        })

        this.send.current.addEventListener("click", (e) => {
            if (this.text.current.value.length !== 0) {
              this.socket.emit("message", this.text.current.value);
              this.text.current.value = "";
            }
          });
          
        this.text.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && this.text.current.value.length !== 0) {
            this.socket.emit("message", this.text.current.value);
            this.current.text.value = "";
        }
        });

        this.socket.on("createMessage", (message, userName) => {
        this.messages.current.innerHTML =
            this.messages.current.innerHTML +
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
                        <div class="main__chat_window">
                            <div class="messages">
                            </div>
                        </div>
                        <div class="main__message_container">
                            <input id="chat_message" type="text" autocomplete="off" placeholder="Type message here..." ref={this.text}/>
                            <div id="send" class="options__button" ref={this.send}>
                                <i class="fa fa-plus" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Webcast;