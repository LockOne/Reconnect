import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Navbar, NavbarBrand } from 'reactstrap';
import Main from "./components/Main";

import { BrowserRouter } from "react-router-dom";

class App extends Component {

  constructor(props) {
    super(props);

  }
  render() {
    return (
        <BrowserRouter>
          <Main/>
        </BrowserRouter>
    );
  }
}

export default App;
