import * as React from "react";
import { Login } from "../authFlow/login";
import { Error } from "../components/notifications/error";
import * as localForage from "localforage";
import { constants } from "../../config";
import { Switch, Route, Redirect } from "react-router";
import { getLogin } from "../../utils/loginUtils";

type HomeState = {
  userData: string;
  errorMessage: string;
  userInternal?: UserInternal;
};

export class Home extends React.Component<{}, HomeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userData: "",
      errorMessage: ""
    };
  }

  handleLogin = (userInternal: UserInternal | undefined): void => {
    this.setState({ userInternal });
    localForage.setItem(constants.LOGGEDIN_USER, userInternal);
  };

  handleError = (errorMessage: string): void => {
    this.setState({ errorMessage });
  };

  componentWillMount() {
    getLogin().then(userInternal => {
      if (userInternal) {
        this.setState({ userInternal });
      }
    });
  }

  render() {
    return (
      <div>
        <Switch>
          <Route
            exact
            path="/"
            render={() =>
              this.state.userInternal ? (
                <Redirect to="/records" />
              ) : (
                <Login loginCallback={this.handleLogin} />
              )
            }
          />
          )} />
        </Switch>
        <Error errorMessage={this.state.errorMessage} />
      </div>
    );
  }
}
