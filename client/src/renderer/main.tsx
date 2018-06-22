import * as React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./home";
import Login from "./login";
import Signup from "./signup";

export default class extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Signup} />
      </Switch>
    );
  }
};
