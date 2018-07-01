import * as React from "react";
import { Login } from "../authFlow/login";
import { Error } from "../components/notifications/error";
import { RecordList } from "./recordList";
import * as localForage from "localforage";
import { constants } from "../../config";

type HomeState = {
  userData: string;
  errorMessage: string;
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
    localForage.setItem(constants.LOGGEDIN_USER, userInternal);
  };

  handleError = (errorMessage: string): void => {
    this.setState({ errorMessage });
  };

  componentWillMount() {
    localForage.getItem(constants.LOGGEDIN_USER).then(item => {
      const userInternal = item as UserInternal;
      this.setState({ userInternal });
    });
  }

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
