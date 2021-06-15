import React, { Component } from 'react';
import { Card, CardBody, CardDeck, CardTitle, CardSubtitle, CardImg, CardImgOverlay, CardText, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';

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

    }
  
    componentWillUnmount() {
      // STEP 5: This will fire when this.state.showWindowPortal in the parent component becomes false
      // So we tidy up by closing the window
      //var video = this.externalWindow.document.querySelector("#selfcam");
      //video.srcObject = null;
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

    }
    
    openClass(c) {
        return;
    }

    render() {
        if (this.props.classes.length === 0 ) {
            fetch(
                "https://tester2.kaist.ac.kr:2443/getclasses",
                {method: "POST",
                body : {}
            })
            .then((response) => {
                console.log("res1 : ", response);
                response.json().then(json => {
                    console.log("json2 :", json);
                    this.props.classes = json;
                });
            })
            .catch((error) => {
                console.log("error : ");
                console.log(error);
            });
        }
        
        console.log("this.props.classes", this.props.classes);

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
                            <Link to="/webcast" className="btn btn-primary">Open</Link>
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
            </div>
        );
    }
}

export default Class;