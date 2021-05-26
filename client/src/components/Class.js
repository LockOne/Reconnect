import React, { Component } from 'react';
import { Card, CardBody, CardDeck, CardTitle, CardSubtitle, CardImg, CardImgOverlay, CardText, Breadcrumb, BreadcrumbItem } from 'reactstrap';

class Class extends Component {
    constructor(props) {
        super(props);
        this.enlarge = this.enlarge.bind(this);
    }
    
    enlarge(c) {
        return;
    }

    render() {
        const classes = this.props.classes.map((c) => {
            return (
                <div key={c.id} className="col-12 col-md-3 m-5 me-auto" style={{cursor: "pointer"}}>
                    <Card className="card p-3" onClick={() => this.enlarge(c)}> 
                        <div className="cardImg">
                            <CardImg top src={c.image} alt={c.name} />
                        </div>
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