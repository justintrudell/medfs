import * as React from "react";
import { Login } from "../authFlow/login";
import { Error } from "../components/notifications/error";
import { RecordList } from "./recordList";

type HomeState = {
  userData: string;
  errorMessage?: string;
  userInternal?: UserInternal;
};

export class Home extends React.Component<{}, HomeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userData: "",
      errorMessage: ""
    };
  }

  handleLogin = (userInternal: UserInternal | undefined): void => {
    this.setState({ userInternal });
  };

  handleError = (errorMessage: string): void => {
    this.setState({ errorMessage });
  };

  render() {
    const mainElem = this.state.userInternal ? (
      <RecordList
        handleError={this.handleError}
        userId={this.state.userInternal.userId}
      />
    ) : (
      <Login loginCallback={this.handleLogin} />
    );
    return (
      <div>
        {mainElem}
        <Error errorMessage={this.state.errorMessage} />
      </div>
    );
  }
}
