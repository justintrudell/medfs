import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { Login } from "./authFlow/login";
import { Signup } from "./authFlow/signup";
import { Records, RecordProps } from "./records/records";
import { isLoggedIn } from "./app";
import { Uploads } from "./records/uploads";
import { Layout } from "antd";
import { UserInternal } from "../models/users";
import { SettingsPage } from "./home/settings_page";

const { Content } = Layout;

interface MainProps extends RecordProps {
  isLoggedIn: isLoggedIn;
  stream?: EventSource;
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
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          height: "85vh"
        }}
      >
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
            exact
            path="/settings"
            render={() => (
              <SettingsPage
                updateIsLoggedIn={this.props.updateIsLoggedIn}
                stream={this.props.stream}
              />
            )}
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
      </Content>
    );
  }
}
