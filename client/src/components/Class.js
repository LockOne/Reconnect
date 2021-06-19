import React, { Component } from 'react';
import { Card, CardBody, CardDeck, CardTitle, CardSubtitle, CardImg, CardImgOverlay, CardText, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';

class Class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showWindowPortal: false,
            classes : [],
        };

        this.toggleWindowPortal = this.toggleWindowPortal.bind(this);
        this.closeWindowPortal = this.closeWindowPortal.bind(this);
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
    
    openClass(c) {
        return;
    }

    render() {
        if (this.state.classes.length === 0 ) {
            fetch(
                "https://tester2.kaist.ac.kr:2443/getclasses",
                {method: "POST",
                body : {}
            })
            .then((response) => {
                console.log("res1 : ", response);
                response.json().then(json => {
                    console.log("json2 :", json);
                    this.setState({classes : json});
                });
            })
            .catch((error) => {
                console.log("error : ");
                console.log(error);
            });
        }
        
        console.log("this.state.classes", this.state.classes);

        const classes = this.state.classes.map((c) => {
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