import * as React from "react";
import { Main } from "./main";
import { Header } from "./home/header";
import { getLogin } from "../utils/loginUtils";
import * as _ from "lodash";
import { RouteComponentProps } from "../../node_modules/@types/react-router";
import { withRouter } from "react-router-dom";

export interface AppState {
  isLoggedIn: boolean;
  updateIsLoggedIn: (isLoggedIn: boolean) => void;
  history?: any;
}

class AppInner extends React.Component<RouteComponentProps<any>, AppState> {
  constructor(props: RouteComponentProps<any>) {
    super(props);

    this.state = {
      isLoggedIn: false,
      updateIsLoggedIn: this.updateLogin
    };
  }

  updateLogin = (isLoggedIn: boolean): void => {
    this.setState({ isLoggedIn }, () => {
      if (this.props.history.location.pathname != "/") {
        this.props.history.push("/");
      }
    });
  };

  componentDidMount() {
    getLogin().then(userInternal => {
      if (!_.isEmpty(userInternal)) {
        this.state.updateIsLoggedIn(true);
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

export const App = withRouter(AppInner);
