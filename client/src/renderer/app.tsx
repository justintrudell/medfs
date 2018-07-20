import * as React from "react";
import { Main } from "./main";
import { Navigation } from "./home/navigation";
import { MedFsHeader } from "./home/header";
import { getLogin } from "../utils/loginUtils";
import { stream } from "../api/record_service";
import * as _ from "lodash";
import { RouteComponentProps } from "react-router";
import { History } from "history";
import { withRouter } from "react-router-dom";
import { Layout } from "antd";
import { MedFsNotification } from "../models/notifications";
import * as localForage from "localforage";

const { Footer } = Layout;

interface AppState {
  userInternal?: UserInternal;
  stream?: EventSource;
  pageTitle?: string;
  notifications: MedFsNotification[];
  updateIsLoggedIn: (userInternal?: UserInternal) => void;
  isLoggedIn: () => boolean;
  setPageTitle: (title?: string) => void;
  addNotification: (notification?: MedFsNotification) => void;
}

export interface DispatchedProps extends AppState {
  history: History;
}

export interface TitleProps {
  setPageTitle: (title?: string) => void;
}

class AppInner extends React.Component<RouteComponentProps<{}>, AppState> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    this.state = {
      userInternal: undefined,
      stream: undefined,
      pageTitle: undefined,
      notifications: [],
      updateIsLoggedIn: this.updateLogin,
      isLoggedIn: this.isLoggedIn,
      setPageTitle: this.setPageTitle,
      addNotification: this.addNotification
    };
  }

  isLoggedIn = (): boolean => {
    return !_.isEmpty(this.state.userInternal);
  };

  updateLogin = (userInternal?: UserInternal): void => {
    if (_.isEmpty(userInternal)) {
      this.setState({
        userInternal,
        stream: undefined,
        notifications: []
      });
      localForage.clear();
    } else {
      const evtSource = stream(
        "/messages/stream/",
        userInternal!.userId,
        this.addNotification
      );
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
        this.state.updateIsLoggedIn(userInternal!);
      }
    });
  }

  render() {
    return (
      <Layout>
        {this.isLoggedIn() && <Navigation {...this.state} {...this.props} />}
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
            {...this.state}
            {...this.props}
            setPageTitle={this.setPageTitle}
          />
          <Footer style={{ textAlign: "center" }}>medFS ©2018</Footer>
        </Layout>
      </Layout>
    );
  }
}

export const app = withRouter(AppInner);
