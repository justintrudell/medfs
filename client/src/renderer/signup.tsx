import * as React from "react";
import * as _ from "lodash";
import * as userAPI from "../api/users";

type State = {
  email: string;
  password: string;
  confirmPassword: string;
};

export class Signup extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: ""
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
    return (
      this.state.password === this.state.confirmPassword &&
      !_.isEmpty(this.state.email)
    );
  }

  handleSubmit(event: React.FormEvent<EventTarget>) {
    event.preventDefault();
    if (!this.validInput()) {
      // TODO: make this reflect in the UI
      console.log("Invalid input");
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
    );
  }
}
