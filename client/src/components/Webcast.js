import Peer from 'peerjs';
import React, { Component } from 'react';
import io from "socket.io-client";

class Webcast extends Component {
    constructor(props) {
        super(props);
        this.shareVideo = React.createRef();
        this.myVideo = React.createRef();
        this.text = React.createRef();
        this.send = React.createRef();
        this.messages = React.createRef();
        this.peer = undefined;
        this.setVideoStream = this.setVideoStream.bind(this);
    }

    setVideoStream (video, stream) {
        console.log("video : ", video);
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
          video.play();
        });
    };

    componentDidMount() {
        this.peer = new Peer("abc", {path: "/peerjs", host: "tester2.kaist.ac.kr", port : "2443"});
        const socket = io("https://tester2.kaist.ac.kr:2443/");

        let myVideoStream;

        var is_webcast_open = false; //webcast open or webcast join
        var userid = "";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)===' ') c = c.substring(1,c.length);
            if (c.indexOf("webcastmode=") === 0) {
                is_webcast_open = true;
            }
            if (c.indexOf("userid=") === 0) {
                userid = c.substring(7);
            }
        }
        
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio : true})
            .then(function (stream) {
                myVideoStream = stream;
                console.log("trying setting myvideo");
                this.setVideoStream(this.myVideo.current, stream);
                console.log("myvideo set");

                if(is_webcast_open) {
                    console.log("this.peer : ", this.peer);
                    this.peer.on("call", (call) => {
                        call.answer(stream);
                    });
                    this.setVideoStream(this.shareVideo.current, stream);
                }
                /*
                socket.on("user-connected", (userid) => {
                    console.log("user connected : ", userid);
                    //this.connectToNewUser(userId, stream);
                });
                */
            })
            .catch(function (err) {
                console.log("Something went wrong!");
            });
        }

        this.peer.on("open", (id) => {
            socket.emit("join-room", 10, id, userid);
        });

        if (!is_webcast_open) {
            const call = this.peer.call(userid, myVideoStream);
            call.on("call", (userVideoStream) => {
                this.setVideoStream(this.shareVideo.current, userVideoStream);
            });
        }

        this.send.current.addEventListener("click", (e) => {
            if (this.text.current.value.length !== 0) {
              socket.emit("message", this.text.current.value);
              this.text.current.value = "";
            }
          });
          
        this.text.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && this.text.current.value.length !== 0) {
            socket.emit("message", this.text.current.value);
            this.current.text.value = "";
        }
        });

        socket.on("createMessage", (message, userName) => {
        this.messages.current.innerHTML =
            this.messages.current.innerHTML +
            `<div class="message">
                <b><i class="far fa-user-circle"></i> <span> ${
                userName === userid ? "me" : userName
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
            <div class="header">
            <div class="logo">
                <h3>Video Chat</h3>
            </div>
            </div>  
            <div class="main">  
            <div class="main__left">
            <div class="videos__group">
                <div id="sharevideo" ref={this.shareVideo}>

                </div>
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
            <div class="main__chat_window">
                <div class="messages">
                   
                </div>
                <div class="messages">
                    <div id="myvideo" ref={this.myVideo}>

                    </div>
                </div>
            </div>
            <div class="main__right2">
                <div class="main__chat_window">
                    <div class="messages" ref={this.messages}>

                    </div>
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