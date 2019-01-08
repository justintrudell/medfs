import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { Login } from "./authFlow/login";
import { Signup } from "./authFlow/signup";
import { Records, RecordProps } from "./records/records";
import { isLoggedIn } from "./app";
import { Uploads } from "./records/uploads";
import { UserInternal } from "../models/users";

interface MainProps extends RecordProps {
  isLoggedIn: isLoggedIn;
}

interface MainState {
  errorMessage: string;
}

export class Main extends React.Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);

    this.state = {
      errorMessage: ""
    };
  }

  handleLogin = (userInternal: UserInternal | undefined): void => {
    this.props.updateIsLoggedIn(userInternal);
  };

  render() {
    return (
      <Switch>
        <Route exact path="/signup" component={Signup} />
        <Route
          exact
          path="/records"
          render={() => <Records {...this.props} />}
        />
        <Route
          exact
          path="/uploads"
          render={() => <Uploads setPageTitle={this.props.setPageTitle} />}
        />
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
    );
  }
}
