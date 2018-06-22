import * as React from "react";
import { HashRouter } from "react-router-dom";
import App from "./app";

export default class extends React.Component {
  render() {
    return (
      <HashRouter>
        <App />
      </HashRouter>
    );
  }
}
