import * as React from "react";

type ErrorProps = {
  errorMessage: string;
};

const errorStyle = {
  color: "red"
};

export class Error extends React.Component<ErrorProps, {}> {
  constructor(props: ErrorProps) {
    super(props);
  }

  render() {
    if (this.props.errorMessage) {
      return <p style={errorStyle}> {this.props.errorMessage} </p>;
    }
    return <div />;
  }
}
