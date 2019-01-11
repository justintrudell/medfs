import * as React from "react";
import { Main } from "./main";
import { Navigation } from "./home/navigation";
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

const { Footer } = Layout;

export type updateIsLoggedIn = (userInternal?: UserInternal) => void;
export type isLoggedIn = () => boolean;
export type setPageTitle = (title?: string) => void;
export type addNotification = (notification?: MedFsNotification) => void;

interface AppState {
  userInternal?: UserInternal;
  stream?: EventSource;
  pageTitle?: string;
  notifications: MedFsNotification[];
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
      notifications: []
    };
  }

  isLoggedIn = (): boolean => {
    return !_.isEmpty(this.state.userInternal);
  };

  updateLogin = (
    userInternal: UserInternal | undefined,
    needsUpdate: boolean
  ): void => {
    if (_.isEmpty(userInternal)) {
      this.setState({
        userInternal,
        stream: undefined,
        notifications: []
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
        notifications: [...prevState.notifications, notification]
      }));
      // Cache this value
    }
  };

  clearNotifications = (visible?: boolean): void => {
    if (!visible && this.state.notifications.length > 0) {
      this.setState({ notifications: [] });
    }
  };

  componentDidMount() {
    getLogin().then(userInternal => {
      if (!_.isEmpty(userInternal)) {
        this.updateLogin(userInternal!, false);
      }
    });
  }

  render() {
    return (
      <Layout>
        {this.isLoggedIn() && (
          <Navigation
            history={this.props.history}
            updateIsLoggedIn={userInternal =>
              this.updateLogin(userInternal, true)
            }
            isLoggedIn={this.isLoggedIn}
            stream={this.state.stream}
          />
        )}
        <Layout
          style={{
            width: "100%",
            minHeight: "100vh",
            marginLeft: this.isLoggedIn() ? 200 : 0,
            overflow: "visible"
          }}
        >
          {this.isLoggedIn() && (
            <MedFsHeader
              notifications={this.state.notifications}
              pageTitle={this.state.pageTitle}
              clearNotifications={this.clearNotifications}
            />
          )}
          <Main
            updateIsLoggedIn={userInternal =>
              this.updateLogin(userInternal, true)
            }
            isLoggedIn={this.isLoggedIn}
            setPageTitle={this.setPageTitle}
          />
          <Footer style={{ textAlign: "center" }}>medFS ©2018</Footer>
        </Layout>
      </Layout>
    );
  }
}

export const app = withRouter(AppInner);
