import React, { Component } from 'react';
import { Jumbotron, Button } from 'reactstrap';


class Home extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="container">
                <Jumbotron>
                    <h1 className="display-3" style={{color: "#87ceeb"}}>Reconnect</h1>
                    <p className="lead">Online lectures for motivated students.</p>
                    <hr className="my-2" />
                    <p>Enroll to classes, improve your education with incentivized platform.</p>
                    <p className="lead">
                    <Button color="primary">Learn More</Button>
                    </p>
                </Jumbotron>
            </div>
        )
    }
}
export default Home;