import * as React from "react";
const { constants } = require("../config");
import * as _ from "lodash";
import { Link } from "react-router-dom";
import { testEndpoint } from "../api/users";

type HomeState = {
  userData: string
};

export default class extends React.Component<any, HomeState> {

  constructor(props: any) {
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

    testEndpoint((error: any, response: any, body: any) => {
      console.log(error);
      console.log(response);
      console.log(body);

      this.setState({ userData: body });
    });

  }

  render() {
    if (this.isLoggedOut()) {
      return (<p> Please <Link to="/login">login</Link> </p >);
    }

    return (
      <p> {this.state.userData} </p>
    );
  }
}
