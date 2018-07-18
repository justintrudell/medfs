import * as React from "react";
import { Alert } from "antd";

type ErrorProps = {
  errorMessage: string;
};

export class Error extends React.Component<ErrorProps, {}> {
  constructor(props: ErrorProps) {
    super(props);
  }

  render() {
    return (
      <div style={{ paddingBottom: 24, textAlign: "left" }}>
        {this.props.errorMessage &&
          <Alert message={this.props.errorMessage} type="error" showIcon />}
      </div>
    );
  }
}
