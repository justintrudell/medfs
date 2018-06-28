import * as React from "react";
import { testEndpoint } from "../../api/users";
import { Login } from "../authFlow/login";
import { Error } from "../components/notifications/error";

type HomeState = {
  userData: string;
  errorMessage?: string;
  isLoggedIn: boolean;
};

export class Home extends React.Component<{}, HomeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userData: "",
      errorMessage: "",
      isLoggedIn: false
    };
  }

  handleLogin = (isLoggedIn: boolean): void => {
    this.setState({ isLoggedIn });
    if (isLoggedIn) {
      this.getUserData();
    }
  };

  getUserData(): void {
    testEndpoint()
      .then(response => {
        if (response.statusCode == 200) {
          this.setState({ userData: response.body });
        } else {
          this.setState({ errorMessage: response.body });
        }
      })
      .catch(error => {
        this.setState({ errorMessage: error });
      });
  }

  render() {
    const mainElem = this.state.isLoggedIn ? (
      <p> {this.state.userData} </p>
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
