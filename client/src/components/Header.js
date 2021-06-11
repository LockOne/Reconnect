import React, { Component } from 'react';
import { Navbar, NavbarBrand, Jumbotron, NavbarToggler, Nav, Collapse, NavItem, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { NavLink, Redirect } from 'react-router-dom';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isNavOpen: false,
            isModalLoginOpen: false,
            isModalRegisterOpen: false,
            isNavBarHidden : false
        }
        this.toggleNav = this.toggleNav.bind(this);
        this.toggleLoginModal = this.toggleLoginModal.bind(this);
        this.toggleRegisterModal = this.toggleRegisterModal.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
    }

    componentDidMount() {
        window.addEventListener('load', this.handleLoad);
     }
    
    componentWillUnmount() { 
        window.removeEventListener('load', this.handleLoad)  
    }

    handleLoad() {
        var nameEQ = "userid=";
        var ca = document.cookie.split(';');
        for(var i=0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) {
                console.log("logined, ", c);
                this.setState({ isNavBarHidden: true });
                break;
            }
        }
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

        var param = {};
        param.userid = this.username.value;
        param.password = this.password.value;

        fetch(
            "https://tester2.kaist.ac.kr:2443/login",
            {method: "POST",
             body : JSON.stringify(param),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then((response) => {
            console.log("res1 : ", response);
            response.json().then(json => {
                console.log("json2 :", json);
                alert(json.msg);
                if (json.code == 0) {
                    this.setState({ isNavBarHidden: true });
                    document.cookie = "userid=" + json.userid + ";path=/";
                }
            });
        })
        .catch((error) => {
            console.log("error : ");
            console.log(error);
        });

        e.preventDefault();
    }
    handleRegister(e) {

        console.log(this);

        var param = {};
        param.userid = this.username.value;
        param.password = this.password.value;
        param.usertype = this.usertype.value;
        alert("client register");
        console.log(param);

        fetch(
            "https://tester2.kaist.ac.kr:2443/register",
            {method: "POST",
             body : JSON.stringify(param),            
            headers: {
                'Content-Type': 'application/json'
            }})
            .then((response) => {
                response.json().then(json => {
                    console.log("json2 :", json);
                    alert(json.msg);
                })
                //alert("register done");
            })
            .catch((error) => {
                console.log("error : ");
                console.log(error);
            });

        this.toggleRegisterModal();
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
                                        <NavLink className="nav-link" to="/classes">
                                            <span className="fa fa-university fa-lg"></span> Classes
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                { (this.state.isNavBarHidden) ? null : 
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
                                }
                                
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
                            <FormGroup className="m-3">
                                <Label htmlFor="usertype">User type</Label>
                                <Input type="select" name="usertype" id="usertype" innerRef={(input) => this.usertype = input}>
                                    <option>Student</option>
                                    <option>Professor</option>
                                    <option>Teaching assistant</option>
                                </Input>
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