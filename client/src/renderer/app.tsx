import * as React from "react";
import { Main } from "./main";
import { Header } from "./home/header";
import { getLogin } from "../utils/loginUtils";
import { stream } from "../api/record_service";
import * as _ from "lodash";
import { RouteComponentProps } from "react-router";
import { History } from "history";
import { withRouter } from "react-router-dom";

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
      <div>
        <Header {...this.state} {...this.props} />
        <Main {...this.state} {...this.props} />
      </div>
    );
  }
}

export const app = withRouter(AppInner);
