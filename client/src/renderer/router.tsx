import * as React from "react";
import { HashRouter, RouteComponentProps } from "react-router-dom";
import { App } from "./app";

interface RouterProps extends RouteComponentProps<any> {}

export class Router extends React.Component<RouterProps, {}> {
  render() {
    return (
      <HashRouter>
        <App {...this.props} />
      </HashRouter>
    );
  }
}
