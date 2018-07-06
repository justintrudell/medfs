import * as React from "react";
import { Main } from "./main";
import { Header } from "./home/header";
import { getLogin } from "../utils/loginUtils";
import * as _ from "lodash";

export interface AppState {
  isLoggedIn: boolean;
  updateIsLoggedIn: (isLoggedIn: boolean) => void;
}

export class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      isLoggedIn: false,
      updateIsLoggedIn: this.updateLogin
    };
  }

  updateLogin = (isLoggedIn: boolean): void => {
    this.setState({ isLoggedIn });
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
        <Header {...this.state} />
        <Main {...this.state} />
      </div>
    );
  }
}
