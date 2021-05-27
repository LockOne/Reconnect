import React, { Component } from 'react';
import { Card, CardBody, CardDeck, CardTitle, CardSubtitle, CardImg, CardImgOverlay, CardText, Collapse, Button } from 'reactstrap';

const LECTURES = 
    [
        {
            id: 1,
            description: "Introduction Lecture",
            notice: ""
        },
        {
            id: 2,
            description: "Advanced Integration",
            notice: "Homework 1 until 04/06/2021. Submit via Email"
        }
            
    ]
class ClassDetail extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        let arr = [];
        for (let i = 0; i < LECTURES.length; i++) {
            arr.push(false);
        }
        this.state = {
            isOpen: arr
        }
    }

    toggle(id) {
        let isOpen = [...this.state.isOpen];
        isOpen[id] = !isOpen[id];
        this.setState({
            isOpen: isOpen
        });
    }
    render() {
        const lectures = LECTURES.map((lecture) => {
            return (
                <div className="row">
                    <h4 className="m-3" style={{ borderStyle: "groove", borderRadius: "10px", cursor: "pointer"}} onClick={() => this.toggle(lecture.id - 1)}> Lecture { lecture.id }</h4>
                    <Collapse isOpen={this.state.isOpen[lecture.id - 1]}>
                        <h5 style={{fontWeight: "normal"}} className="m-3">{ lecture.description }</h5>
                    </Collapse>
                </div>
            )
        })
        return (
            <div className="container">
                <div className="row ">
                    <div className="col-12 col-md-8">
                        <h2 className="m-3">{ this.props.c.name }</h2>
                        <h6 className="m-3">{ this.props.c.label }</h6>
                        <h5 className="m-3">{ this.props.c.description } </h5>
                    </div>
                    <div className="col-12 col-md-4">
                        <img className="classImg m-3" src={ this.props.c.image }></img>
                    </div>
                </div>
                { lectures }
            </div>
        )
    }
}

export default ClassDetail;