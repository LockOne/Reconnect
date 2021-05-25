import React, { Component } from 'react';
import { Navbar, NavbarBrand, Jumbotron, NavbarToggler, Nav, Collapse, NavItem, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { NavLink } from 'react-router-dom';
class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isNavOpen: false,
            isModalOpen: false
        }
        this.toggleNav = this.toggleNav.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }
    toggleNav() {
        this.setState({ isNavOpen: !this.state.isNavOpen });
    }
    toggleModal() {
        this.setState({ isModalOpen: !this.state.isModalOpen });
    }
    handleLogin(e) {
        this.toggleModal();
        alert("Username: " + this.username.value + " Password: " + this.password.value + " Remember me: " + this.remember.value);
        e.preventDefault();
    }
    render() {
        return (
            <React.Fragment>
                    <Navbar dark expand="md">
                        <NavbarToggler onClick={ this.toggleNav }/>
                        <div className="container">
                            <NavbarBrand className="mr-auto" href="/">
                            <h2 className="display-7" style={{color: "#87ceeb"}}>Reconnect</h2>
                            </NavbarBrand>
                            <Collapse isOpen={ this.state.isNavOpen } navbar className="justify-content-between">
                                <Nav navbar className="mr-auto">
                                    <NavItem>
                                        <NavLink className="nav-link" to="/home">
                                            <span className="fa fa-home fa-lg"></span> Home
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className="nav-link" to="/aboutus">
                                            <span className="fa fa-info fa-lg"></span> About Us
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className="nav-link" to="/menu">
                                            <span className="fa fa-list fa-lg"></span> Menu
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className="nav-link" to="/contactus">
                                            <span className="fa fa-address-card fa-lg"></span> Contact Us
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <Nav navbar>
                                    <NavItem>
                                        <Button outline onClick={this.toggleModal} style={{borderColor: "transparent"}}>
                                            <span className="fa fa-sign-in fa-lg" ></span> Login
                                        </Button>
                                    </NavItem>
                                    <NavItem>
                                    <Button outline onClick={this.toggleModal} style={{ borderColor: "transparent" }}>
                                            <span className="fa fa-user-plus fa-lg"></span> Register
                                        </Button>
                                    </NavItem>
                                </Nav>
                                
                            </Collapse>
                        </div>
                    </Navbar>
                <Jumbotron>
                    <h1 className="display-3" style={{color: "#87ceeb"}}>Reconnect</h1>
                    <p className="lead">Online lectures for motivated students.</p>
                    <hr className="my-2" />
                    <p>Enroll to classes, improve your education with incentivized platform.</p>
                    <p className="lead">
                    <Button color="primary">Learn More</Button>
                    </p>
                </Jumbotron>
                <Modal isOpen={ this.state.isModalOpen } toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}>Login</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleLogin}>
                            <FormGroup className="m-3">
                                <Label htmlFor="username">Username</Label>
                                <Input type="text" id="username" name="username" innerRef={ (input) => this.username = input}/>
                            </FormGroup>
                            <FormGroup className="m-3">
                                <Label htmlFor="password">Password</Label>
                                <Input type="password" id="password" name="password" innerRef={(input) => this.password = input}/>
                            </FormGroup>
                            <FormGroup className="m-3" check>
                                <Label check>
                                    <Input type="checkbox" name="remember" innerRef={ (input) => this.remember = input }/> Remember me
                                </Label>
                            </FormGroup>
                            <div className="text-center">
                                <Button type="submit" className="primary">Login</Button>
                                </div>
                        </Form>
                    </ModalBody>
                </Modal>
            </React.Fragment>
        )
    }
}
export default Header;