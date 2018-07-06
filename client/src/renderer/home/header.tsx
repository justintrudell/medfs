import * as React from "react";
import { Link } from "react-router-dom";
import { Logout } from "../authFlow/logout";
import { AppState } from "../app";

export class Header extends React.Component<AppState, {}> {
  render() {
    return (
      <div>
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/signup">Signup</Link>
              </li>
            </ul>
          </nav>
        </header>
        {this.props.isLoggedIn && <Logout {...this.props} />}
      </div>
    );
  }
}
