import * as React from "react";
import { logout } from "../../api/auth";
import { updateIsLoggedIn, isLoggedIn } from "../app";

export interface LogoutProps {
  stream?: EventSource;
  updateIsLoggedIn: updateIsLoggedIn;
  isLoggedIn: isLoggedIn;
}

export class Logout extends React.Component<LogoutProps, {}> {
  logoutClick = () => {
    logout().then(_result => {
      this.props.updateIsLoggedIn(undefined);
      this.props.stream!.close();
    });
  };

  render() {
    return (
      this.props.isLoggedIn() && (
        <div
          onClick={this.logoutClick}
          style={{
            position: "absolute",
            bottom: 0,
            textAlign: "center",
            padding: 24,
            width: "100%"
          }}
          className="ant-menu-dark"
        >
          <span className="ant-menu-item">Logout</span>
        </div>
      )
    );
  }
}
