import React, { Component } from 'react';
import { Card, CardBody, CardDeck, CardTitle, CardSubtitle, CardImg, CardImgOverlay, CardText, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import './Webcast.css';

class MyWindowPortal extends React.PureComponent {
    constructor(props) {
      super(props);
      // STEP 1: create a container <div>
      this.containerEl = document.createElement('div');
      this.externalWindow = null;
      this.wss = undefined;
    }
  
    render() {
      // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
      return ReactDOM.createPortal(this.props.children, this.containerEl);
    }
  
    componentDidMount() {
        // STEP 3: open a new browser window and store a reference to it
        this.externalWindow = window.open('', '', 'width=1300,height=700,left=200,top=200');
    
        // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
        this.externalWindow.document.body.appendChild(this.containerEl);
        this.externalWindow.addEventListener('beforeunload', () => {
            this.props.closeWindowPortal();
        });

        var video = this.externalWindow.document.querySelector("#selfcam");

        console.log("video : ", video);

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play()
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
        }

        var isopen = false;
        var userid = "";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf("webcastmode=") == 0) {
                isopen = true;
            }
            if (c.indexOf("userid=") == 0) {
                userid = c.substring(7);
                console.log("userid 1", userid);
            }
        }

        var intervalID1 = undefined;
        var intervalID2 = undefined;

        if (isopen) {
            this.externalWindow.document.querySelector("#videoimg").style.display = 'none';
            var streamvideo = this.externalWindow.document.querySelector("#streamcam");
            streamvideo.style.display = 'block';
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    streamvideo.srcObject = stream;
                    streamvideo.play()
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                });
            }

            fetch(
                "https://tester2.kaist.ac.kr:2443/removeallpart",
                {method: "POST",
                 body : {}
            })
                .then((response) => {
                })
                .catch((error) => {
                    console.log("fetch 1 error : ");
                    console.log(error);
            });
        } else {

            var param = {};
            param.userid = userid;
            param.participating = "X";

            intervalID1 = setInterval(() => {

                const canvas = document.createElement('canvas');
                canvas.id = 'tmpid'
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                
                //mock;
                var rand1 = Math.random();
                if (rand1 < 0.1) {
                    param.participating = "O";
                } else {
                    param.participating = "X";
                }
            
                fetch(
                    "https://tester2.kaist.ac.kr:2443/updategaze",
                    {method: "POST",
                     body : JSON.stringify(param),
                     headers: {
                         'Content-Type' : 'application/json'
                     }
                })
                    .then((response) => {
                    })
                    .catch((error) => {
                        console.log("fetch 2 error : ");
                        console.log(error);
                });
            }, 1000);
        }

        const getFrame = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const data = canvas.toDataURL('image/jpeg', 0.7);
            return data;
        }

        const WSS_URL = "wss://tester2.kaist.ac.kr:2443";
		const FPS = 30;
		this.wss = new WebSocket(WSS_URL);

		this.wss.onopen = () => {
			console.log("Stream: Connected to " + WSS_URL);
            if (isopen) {
                this.wss.send(1);
                intervalID1 = setInterval( () => {
                    this.wss.send(getFrame());
                }, 1000 / FPS);
            } else {
                this.wss.send(0);                
            }
            intervalID2 = setInterval( () => {
                fetch(
                    "https://tester2.kaist.ac.kr:2443/getgaze",
                    {method: "POST",
                     body : JSON.stringify(param),
                     headers: {
                         'Content-Type' : 'application/json'
                     }
                })
                    .then((response) => {
                        response.json().then(json => {
                            var parti = this.externalWindow.document.querySelector("#participants");
                            var resultstr = "";
                            json.data.forEach((value, index, array) => {
                                resultstr = resultstr + value.userid + " " + value.participating + "<br>";
                            })
                            parti.innerHTML = resultstr;
                            console.log("resultstr : ", resultstr);
                        });
                    })
                    .catch((error) => {
                        console.log("fetch 2 error : ");
                        console.log(error);
                });
            }, 1000);
		}

        if (!isopen) {
            this.wss.onmessage = message => {
                const img = this.externalWindow.document.querySelector("#videoimg");
                img.src =message.data;    
            }
        }

		this.wss.onerror = function(event) {
			console.log("stream: Server error, ", event);
		}

		this.wss.onclose = () => {
			console.log("Server disconnected");
            document.cookie = 'webcastmode=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            this.externalWindow.close();
            if (intervalID1 != undefined) {
				clearInterval(intervalID1);
			}
            if (intervalID2 != undefined) {
				clearInterval(intervalID2);
			}
		}
    }
  
    componentWillUnmount() {
      // STEP 5: This will fire when this.state.showWindowPortal in the parent component becomes false
      // So we tidy up by closing the window
      var video = this.externalWindow.document.querySelector("#selfcam");
      video.srcObject = null;
      this.externalWindow.close();
      this.wss.close();
    }
  }


class Class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showWindowPortal: false,
          };

        this.toggleWindowPortal = this.toggleWindowPortal.bind(this);
        this.closeWindowPortal = this.closeWindowPortal.bind(this);
        this.openwebcast = this.openwebcast.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', () => {
          this.closeWindowPortal();
        });

        document.cookie = 'webcastmode=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }

    toggleWindowPortal() {
        this.setState(state => ({
        ...state,
        showWindowPortal: !state.showWindowPortal,
        }));

        //this.state.showWindowPortal = !this.state.showWindowPortal;
    }
  
    closeWindowPortal() {
        this.setState({ showWindowPortal: false })
    }

    joinwebcast() {
    }

    openwebcast() {

        document.cookie = "webcastmode=open;path=/";
        this.setState(state => ({
            ...state,
            showWindowPortal: !state.showWindowPortal,
            }));    

    }
    
    openClass(c) {
        return;
    }

    render() {
        const classes = this.props.classes.map((c) => {
            return (
                
                <div key={c.id} className="col-12 col-md-3 m-5 me-auto">
                        <Card className="card p-3" onClick={() => this.openClass(c)}> 
                            <Link to={`/classes/${c.id}`}>
                                <div className="cardImg">
                                    <CardImg top src={c.image} alt={c.name} />
                                </div>
                            </Link>
                            <CardTitle className="m-1" tag="h5">
                                { c.name }
                            </CardTitle>
                            <CardSubtitle className="m-1" tag="h6">
                                { c.label }
                            </CardSubtitle>
                            <CardText>
                                { c.description }
                            </CardText>
                        </Card>
                    <div className="row justify-content-evenly p-2">
                        <div className="col-12 col-md-auto text-center">
                            <Button color="primary" className="buttons" onClick={this.toggleWindowPortal}> Join </Button>
                        </div>
                        <div className="col-12 col-md-auto text-center">
                            <Button color="warning" className="buttons" onClick={this.openwebcast}> Open </Button>
                        </div>
                    </div>
                </div>
            )
        });
        return (
            <div className="container">
                <div className="row justify-content-start">
                    {classes}
                </div>
                {this.state.showWindowPortal && (
                        <MyWindowPortal closeWindowPortal={this.closeWindowPortal} >{
                            
                            <div className="container">
                                <link rel="stylesheet" href="https://tester2.kaist.ac.kr:1443/Webcast.css"></link>
                                <div style={{float:'left'}} class="big1">
                                    <img id="videoimg" width="800" height="600">
                                    </img>
                                    <video id="streamcam" autoplay="true" width="800" height="600" muted = "muted" display='none'>
                                    </video>
                                </div>
                                <div style={{float:'right'}} class="big2">
                                    <div class="small1">
                                        <p id="participants"> participants : </p>
                                    </div>
                                    <div >
                                        <video autoplay="true" id = "selfcam" class="small1" muted="muted">
                                        </video>
                                    </div>
                                </div>
                                <div class="subtitle">
                                  subtitle
                                </div>
                            </div>
                        }

                        </MyWindowPortal>
                        )}
            </div>
        );
    }
}

export default Class;