import React, { Component } from 'react';
import { Navbar, NavbarBrand, Jumbotron, NavbarToggler, Nav, Collapse, NavItem, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { NavLink } from 'react-router-dom';
class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isNavOpen: false,
            isModalLoginOpen: false,
            isModalRegisterOpen: false
        }
        this.toggleNav = this.toggleNav.bind(this);
        this.toggleLoginModal = this.toggleLoginModal.bind(this);
        this.toggleRegisterModal = this.toggleRegisterModal.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
    }
    toggleNav() {
        this.setState({ isNavOpen: !this.state.isNavOpen });
    }
    toggleLoginModal() {
        this.setState({ isModalLoginOpen: !this.state.isModalLoginOpen });
    }
    toggleRegisterModal() {
        this.setState({ isModalRegisterOpen: !this.state.isModalRegisterOpen });
    }
    handleLogin(e) {
        this.toggleLoginModal();
        alert("Username: " + this.username.value + " Password: " + this.password.value + " Remember me: " + this.remember.value);
        e.preventDefault();
    }
    handleRegister(e) {
        this.toggleRegisterModal();
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
                                        <Button outline onClick={this.toggleLoginModal} style={{borderColor: "transparent", boxShadow: "none"}}>
                                            <span className="fa fa-sign-in fa-lg" ></span> Login
                                        </Button>
                                    </NavItem>
                                    <NavItem>
                                    <Button outline onClick={this.toggleRegisterModal} style={{ borderColor: "transparent", boxShadow: "none" }}>
                                            <span className="fa fa-user-plus fa-lg"></span> Register
                                        </Button>
                                    </NavItem>
                                </Nav>
                                
                            </Collapse>
                        </div>
                    </Navbar>

                <Modal isOpen={ this.state.isModalLoginOpen } toggle={this.toggleLoginModal}>
                    <ModalHeader toggle={this.toggleLoginModal}>Login</ModalHeader>
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

                <Modal isOpen={ this.state.isModalRegisterOpen } toggle={this.toggleRegisterModal}>
                    <ModalHeader toggle={this.toggleRegisterModal}>Register</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleRegister}>
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
                                <Button type="submit" className="primary">Register</Button>
                                </div>
                        </Form>
                    </ModalBody>
                </Modal>
                
            </React.Fragment>
        )
    }
}
export default Header;