import * as React from "react";
import { executeLogout } from "../../utils/loginUtils";
import { AppState } from "../app";

export class Logout extends React.Component<AppState, {}> {
  logoutClick = () => {
    executeLogout().then(_result => {
      this.props.updateIsLoggedIn(undefined);
      this.props.stream!.close();
    });
  };

  render() {
    return this.props.isLoggedIn() ? (
      <button onClick={this.logoutClick}> Logout </button>
    ) : (
      <div />
    );
  }
}
