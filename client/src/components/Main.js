import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from "react-router-dom";

import Header from "./Header";
import Class from "./Class";
import Home from "./Home";
import ClassDetail from "./ClassDetail";
import Webcast from "./Webcast";

//This constant is not being used not; Left here for reference
const CLASSES =
    [
        {
        id: 0,
        name:'Python Basics for Data Science',
        image: 'https://prod-discovery.edx-cdn.org/media/course/image/381a0046-5d78-4790-8776-74620d59f48e-e2e7f4677ce2.small.jpeg',
        description: "This Python course provides a beginner-friendly introduction to Python for Data Science. Practice through lab exercises, and you'll be ready to create your first Python scripts on your own!"
        },
        {
        id: 1,
        name:'Analyzing and Visualizing Data with Power BI',
        image: 'https://prod-discovery.edx-cdn.org/media/course/image/aad55b53-a751-4e24-840e-131a3e9ba466-74b7e571e339.small.png',
        description:'Step up your analytics game and learn one of the most in-demand job skills in the United States.'
        },
        {
        id: 2,
        name:'IBM Data Analyst',
        image: 'https://prod-discovery.edx-cdn.org/media/programs/card_images/5038aae3-cc09-4995-a33a-8ca6bd03952e-9caf53c6bed2.jpg',
        description:'Drive your career forward with this fascinating class where you will do lots of things'
        },
        {
        id: 3,
        name:'Introduction to Data Analytics',
        image: 'https://prod-discovery.edx-cdn.org/media/course/image/4315ba0c-a4cf-4f88-badd-fd8a3027fac3-b37742dd9212.small.jpg',
        description:'Through a combination of lectures, business case studies, and hands-on learning this course provides an introduction to data analytics techniques and their application in business.'
        }
    ];

class Main extends Component {

  constructor(props) {
    super(props);
    this.classes = [];

    fetch(
      "https://tester2.kaist.ac.kr:2443/getclasses",
      {method: "POST",
       body : {}
    })
    .then((response) => {
        console.log("res1 : ", response);
        response.json().then(json => {
            console.log("json2 :", json);
            this.classes = json;
        });
    })
    .catch((error) => {
        console.log("error : ");
        console.log(error);
    });
  }

  render() {
    const ClassWithId = ({ match }) => {
      return (
        <ClassDetail c={this.classes.filter(cl => cl.id === parseInt(match.params.id, 10))[0]}/>
      )
    }
    return (
        
          <div>
            <Header />
            <Switch>
              <Route exact path="/classes" component={() => <Class classes={this.classes} />} />
              <Route path="/home" component={Home}/>
              <Route exact path="/classes/:id" component={ClassWithId}/>
              <Route exact path="/webcast" component = {() => <Webcast/>} />
              <Redirect to="/home"/>
            </Switch>
          </div>
    );
  }
}

export default Main;
