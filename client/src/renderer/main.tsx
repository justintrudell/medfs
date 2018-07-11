import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { Login } from "./authFlow/login";
import { Signup } from "./authFlow/signup";
import { Records } from "./records/records";
import { AppState } from "./app";
import * as localForage from "localforage";
import { constants } from "../config";
import { Error } from "./components/notifications/error";

interface MainState {
  errorMessage: string;
}

export class Main extends React.Component<AppState, MainState> {
  constructor(props: AppState) {
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
      <div>
        <Switch>
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
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/records" component={Records} />
        </Switch>
        <Error errorMessage={this.state.errorMessage} />
      </div>
    );
  }
}
