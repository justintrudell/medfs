import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { Home } from "./home/home";
import { Login } from "./authFlow/login";
import { Signup } from "./authFlow/signup";

export class Main extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
        </Switch>
      </div>
    );
  }
}
