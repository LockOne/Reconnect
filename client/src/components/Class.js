import React, { Component } from 'react';
import { Card, CardBody, CardDeck, CardTitle, CardSubtitle, CardImg, CardImgOverlay, CardText, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
class Class extends Component {
    constructor(props) {
        super(props);
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
                            <Button color="primary" className="buttons"> Join </Button>
                        </div>
                        <div className="col-12 col-md-auto text-center">
                            <Button color="warning" className="buttons" > Cancel </Button>
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