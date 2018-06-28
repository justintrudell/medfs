import * as React from "react";
import * as _ from "lodash";
import * as userAPI from "../../api/users";
import { Error } from "../components/notifications/error";

type State = {
  email: string;
  password: string;
  confirmPassword: string;
  errorMsg?: string;
};

export class Signup extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      errorMsg: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.FormEvent<EventTarget>) {
    const target = event.target as HTMLInputElement;
    const toAdd = { [target.id]: target.value } as State;
    this.setState(toAdd);
  }

  validInput(): boolean {
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({ errorMsg: "Passwords don't match" });
      return false;
    }

    if (_.isEmpty(this.state.email) || _.isEmpty(this.state.password)) {
      this.setState({ errorMsg: "Please fill out all fields" });
      return false;
    }

    return true;
  }

  handleSubmit(event: React.FormEvent<EventTarget>) {
    event.preventDefault();
    if (!this.validInput()) {
      return;
    }

    userAPI
      .createUser(this.state.email, this.state.password)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <h1>Register</h1>

          <label>
            <b>Email</b>
          </label>
          <input
            type="text"
            placeholder="Enter Email"
            id="email"
            required
            value={this.state.email}
            onChange={this.handleChange}
          />

          <label>
            <b>Password</b>
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            id="password"
            required
            value={this.state.password}
            onChange={this.handleChange}
          />

          <label>
            <b>Repeat Password</b>
          </label>
          <input
            type="password"
            placeholder="Repeat Password"
            id="confirmPassword"
            required
            value={this.state.confirmPassword}
            onChange={this.handleChange}
          />

          <input type="submit" value="Submit" />
        </form>
        <Error errorMessage={this.state.errorMsg} />
      </div>
    );
  }
}
