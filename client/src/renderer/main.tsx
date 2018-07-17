import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { Login } from "./authFlow/login";
import { Signup } from "./authFlow/signup";
import { Records } from "./records/records";
import { DispatchedProps } from "./app";
import * as localForage from "localforage";
import { constants } from "../config";
import { Error } from "./components/notifications/error";
import "antd/dist/antd.css";
import { Layout } from "antd";

interface MainState {
  errorMessage: string;
}

export class Main extends React.Component<DispatchedProps, MainState> {
  constructor(props: DispatchedProps) {
    super(props);

    this.state = {
      errorMessage: ""
    };
  }

  handleLogin = (userInternal: UserInternal | undefined): void => {
    localForage.setItem(constants.LOGGEDIN_USER, userInternal);
    this.props.updateIsLoggedIn(userInternal);
  };

  render() {
    return (
      <Layout style={{ height: "100vh" }}>
        <Switch>
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/records" component={Records} />
          <Route
            path="/"
            render={() =>
              this.props.isLoggedIn() ? (
                <Records {...this.props} />
              ) : (
                <Login loginCallback={this.handleLogin} />
              )
            }
          />
        </Switch>
        <Error errorMessage={this.state.errorMessage} />
      </Layout>
    );
  }
}
