import * as React from "react";
import { executeLogout } from "../../utils/loginUtils";
import { DispatchedProps } from "../app";

export class Logout extends React.Component<DispatchedProps, {}> {
  logoutClick = () => {
    executeLogout().then(_result => {
      this.props.updateIsLoggedIn(undefined);
      this.props.stream!.close();
    });
  };

  render() {
    return this.props.isLoggedIn() && (
      <div
        onClick={this.logoutClick}
        style={{ position: "absolute", bottom: 0, textAlign: "center", padding: 24, width: "100%" }}
        className="ant-menu-dark">
        <span className="ant-menu-item">Logout</span>
      </div>
    );
  }
}
