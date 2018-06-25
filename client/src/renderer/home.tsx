import * as React from "react";
import { constants } from "../config";
import * as _ from "lodash";
import { Link } from "react-router-dom";
import { testEndpoint } from "../api/users";

type HomeState = {
  userData: string;
};

export class Home extends React.Component<{}, HomeState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      userData: ""
    };
  }

  isLoggedOut(): boolean {
    return _.isEmpty(sessionStorage.getItem(constants.LOGIN_KEY));
  }

  componentDidMount() {
    if (this.isLoggedOut()) {
      return;
    }

    testEndpoint()
      .then(response => {
        console.log(response);
        this.setState({ userData: response.body });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    if (this.isLoggedOut()) {
      return (
        <p>
          {" "}
          Please <Link to="/login">login</Link>{" "}
        </p>
      );
    }

    return <p> {this.state.userData} </p>;
  }
}
