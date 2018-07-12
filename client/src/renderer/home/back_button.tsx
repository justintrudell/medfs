import * as React from "react";
import { DispatchedProps } from "../app";

export class BackButton extends React.Component<DispatchedProps, {}> {
  constructor(props: DispatchedProps) {
    super(props);
  }

  render() {
    return <button onClick={this.props.history.goBack}>Back</button>;
  }
}
