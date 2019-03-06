import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { Login } from "./authFlow/login";
import { Signup } from "./authFlow/signup";
import { Records, RecordProps } from "./records/records";
import { isLoggedIn, isDoctor } from "./app";
import { Uploads } from "./records/uploads";
import { Layout } from "antd";
import { UserInternal } from "../models/users";
import { SettingsPage } from "./home/settings_page";
import { Patients } from "./patients/patients";
import { PatientDetails } from "./patients/patient_details";
import { NotificationsPage } from "./home/notifications_page";
import { MedFsNotification } from "../models/notifications";
const { Content } = Layout;

interface MainProps extends RecordProps {
  isLoggedIn: isLoggedIn;
  stream?: EventSource;
  isDoctor: isDoctor;
  notifications: MedFsNotification[];
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
          padding: 24,
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
            path="/uploads/:autofill_email?"
            render={({ match }) => (
              <Uploads setPageTitle={this.props.setPageTitle} match={match} />
            )}
          />
          <Route
            exact
            path="/uploads/update/:record_id"
            render={({ match }) => (
              <Uploads setPageTitle={this.props.setPageTitle} match={match} />
            )}
          />
          <Route exact path="/settings" render={() => <SettingsPage />} />
          <Route
            exact
            path="/notifications"
            render={() => (
              <NotificationsPage />
            )}
          />
          {this.props.isDoctor() && (
            <Route
              exact
              path="/patients"
              render={() => <Patients {...this.props} />}
            />
          )}
          {this.props.isDoctor() && (
            <Route
              path="/patients/:patient_id"
              render={({ match }) => (
                <PatientDetails {...this.props} match={match} />
              )}
            />
          )}
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
