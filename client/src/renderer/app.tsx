import * as React from "react";
import { Main } from "./main";
import { MedFsHeader } from "./home/header";
import { getLogin, setLogin, clearLogin } from "../utils/loginUtils";
import { stream } from "../api/record_service";
import * as _ from "lodash";
import { RouteComponentProps } from "react-router";
import { History } from "history";
import { withRouter } from "react-router-dom";
import { Layout } from "antd";
import { MedFsNotification } from "../models/notifications";
import { UserInternal } from "../models/users";
import { logout } from "../api/auth";

const { Content } = Layout;

export type updateIsLoggedIn = (userInternal?: UserInternal) => void;
export type isLoggedIn = () => boolean;
export type isDoctor = () => boolean;
export type setPageTitle = (title?: string) => void;
export type addNotification = (notification?: MedFsNotification) => void;

interface AppState {
  userInternal?: UserInternal;
  stream?: EventSource;
  pageTitle?: string;
  notifications: MedFsNotification[];
  previewedNotifications: MedFsNotification[];
}

export interface HistoryProps {
  history: History;
}

export interface TitleProps {
  setPageTitle: setPageTitle;
}

class AppInner extends React.Component<RouteComponentProps<{}>, AppState> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    this.state = {
      userInternal: undefined,
      stream: undefined,
      pageTitle: undefined,
      notifications: [],
      previewedNotifications: []
    };
  }

  isLoggedIn = (): boolean => {
    return !_.isEmpty(this.state.userInternal);
  };

  isDoctor = (): boolean => {
    return (
      this.isLoggedIn() &&
      this.state.userInternal !== undefined &&
      this.state.userInternal.isDoctor
    );
  };

  updateLogin = (
    userInternal: UserInternal | undefined,
    needsUpdate: boolean
  ): void => {
    if (_.isEmpty(userInternal)) {
      this.setState({
        userInternal,
        stream: undefined,
        notifications: [],
        previewedNotifications: []
      });

      clearLogin().catch(err => console.error(err));
    } else {
      const evtSource = stream(
        "/messages/stream/",
        userInternal!.userId,
        this.addNotification
      );
      if (needsUpdate) {
        setLogin(userInternal!).catch(err => console.error(err));
      }

      this.setState({ userInternal, stream: evtSource });
    }

    if (this.props.history.location.pathname !== "/") {
      this.props.history.push("/");
    }
  };

  setPageTitle = (title?: string): void => {
    if (this.state.pageTitle !== title) {
      this.setState({ pageTitle: title });
    }
  };

  addNotification = (notification?: MedFsNotification): void => {
    if (notification) {
      this.setState(prevState => ({
        previewedNotifications: [
          ...prevState.previewedNotifications,
          notification
        ],
        notifications: [...prevState.notifications, notification]
      }));
    }
  };

  clearNotifications = (visible?: boolean): void => {
    if (!visible && this.state.previewedNotifications.length > 0) {
      this.setState({ previewedNotifications: [] });
    }
  };

  componentDidMount() {
    getLogin().then(userInternal => {
      if (!_.isEmpty(userInternal)) {
        this.updateLogin(userInternal!, false);
      }
    });
  }

  handleLogout = () => {
    logout()
      .then(res => {
        if (!res) {
          console.error("Something went wrong");
        }
        this.state.stream!.close();
        this.updateLogin(undefined, true);
      })
      .catch(err => {
        console.error(err);
      });
  };

  render() {
    return (
      <Layout
        style={{
          width: "100%",
          minHeight: "100vh",
          overflow: "visible"
        }}
      >
        {this.isLoggedIn() && (
          <MedFsHeader
            history={this.props.history}
            notifications={this.state.previewedNotifications}
            pageTitle={this.state.pageTitle}
            clearNotifications={this.clearNotifications}
            isDoctor={this.isDoctor}
            logout={this.handleLogout}
            userEmail={
              this.state.userInternal ? this.state.userInternal.email : null
            }
          />
        )}
        <Content style={{ paddingTop: this.isLoggedIn() ? "0" : "30px" }}>
          <Main
            updateIsLoggedIn={userInternal =>
              this.updateLogin(userInternal, true)
            }
            isLoggedIn={this.isLoggedIn}
            setPageTitle={this.setPageTitle}
            stream={this.state.stream}
            isDoctor={this.isDoctor}
            notifications={this.state.notifications}
          />
        </Content>
      </Layout>
    );
  }
}

export const app = withRouter(AppInner);
