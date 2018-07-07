import * as React from "react";
import { HashRouter } from "react-router-dom";
import * as App from "./app";

export class Router extends React.Component {
  render() {
    return (
      <HashRouter>
        <App.app />
      </HashRouter>
    );
  }
}
