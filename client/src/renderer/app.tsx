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


interface AppState {
  userInternal?: UserInternal;
  stream?: EventSource;
  updateIsLoggedIn: (userInternal?: UserInternal) => void;
  isLoggedIn: () => boolean;
}

export interface DispatchedProps extends AppState {
  history: History;
}

class AppInner extends React.Component<RouteComponentProps<{}>, AppState> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    this.state = {
      userInternal: undefined,
      stream: undefined,
      updateIsLoggedIn: this.updateLogin,
      isLoggedIn: this.isLoggedIn
    };
  }

  isLoggedIn = (): boolean => {
    return !_.isEmpty(this.state.userInternal);
  };

  updateLogin = (userInternal?: UserInternal): void => {
    this.setState({ userInternal }, () => {
      if (this.props.history.location.pathname !== "/") {
        this.props.history.push("/");
      }
      if (this.isLoggedIn()) {
        const evtSource = stream(
          "/messages/stream/",
          this.state.userInternal!.userId
        );
        this.setState({
          stream: evtSource
        });
      }
    });
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
          style={{ width: "100%", minHeight: "100vh", marginLeft: this.isLoggedIn() ? 200 : 0, overflow: "visible" }}>
          {this.isLoggedIn() && <MedFsHeader {...this.state} {...this.props} />}
          <Main {...this.state} {...this.props} />
        </Layout>
      </Layout>
    );
  }
}

export const app = withRouter(AppInner);
