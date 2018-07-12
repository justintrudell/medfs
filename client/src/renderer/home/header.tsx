import * as React from "react";
import { Link } from "react-router-dom";
import { Logout } from "../authFlow/logout";
import { DispatchedProps } from "../app";
import { BackButton } from "./back_button";

export class Header extends React.Component<DispatchedProps, {}> {
  render() {
    return (
      <div>
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              {!this.props.isLoggedIn() && (
                <li>
                  <Link to="/signup">Signup</Link>
                </li>
              )}
            </ul>
          </nav>
        </header>
        {this.props.isLoggedIn() && <Logout {...this.props} />}
        <BackButton {...this.props} />
      </div>
    );
  }
}
