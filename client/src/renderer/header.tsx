import * as React from "react";
import { Link } from "react-router-dom";

export default class extends React.Component {
  render() {
    return (
      <header>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </nav>
      </header>
    );
  }
};
