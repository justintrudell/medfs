import * as React from 'react';
import * as _ from "lodash";
const userAPI = require("../api/users");

type State = {
  email?: string,
  password?: string,
  confirmPassword?: string
}

export default class extends React.Component<any, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    let toAdd = {
      [event.target.id]: event.target.value
    } as State
    this.setState(toAdd);
  }

  validInput(): boolean {
    if (this.state.password != this.state.confirmPassword) {
      return false;
    }

    if (_.isEmpty(this.state.email)) {
      return false;
    }

    return true;
  }

  handleSubmit(event: any) {
    event.preventDefault();
    if (!this.validInput()) {
      // TODO: make this reflect in the UI
      console.log("Invalid input");
    }

    userAPI.createUser(this.state.email, this.state.password,
      function (error: any, response: any, body: any) {
        console.log(error);
        console.log(response);
        console.log(body);
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Register</h1>

        <label ><b>Email</b></label>
        <input
          type="text"
          placeholder="Enter Email"
          id="email"
          required
          value={this.state.email}
          onChange={this.handleChange} />

        <label><b>Password</b></label>
        <input
          type="password"
          placeholder="Enter Password"
          id="password"
          required
          value={this.state.password}
          onChange={this.handleChange} />

        <label><b>Repeat Password</b></label>
        <input
          type="password"
          placeholder="Repeat Password"
          id="confirmPassword"
          required
          value={this.state.confirmPassword}
          onChange={this.handleChange} />

        <input type="submit" value="Submit" />
      </form>
    );
  }
};
