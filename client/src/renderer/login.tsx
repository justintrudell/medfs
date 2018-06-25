import * as React from "react";
import * as authAPI from "../api/auth";
import { constants } from "../config";

type LoginState = {
  email: string;
  password: string;
};

interface LoginProps {
  history: string[];
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: React.FormEvent<EventTarget>) {
    const target = event.target as HTMLInputElement;
    const toAdd = { [target.id]: target.value } as LoginState;
    this.setState(toAdd);
  }

  handleSubmit(event: React.FormEvent<EventTarget>) {
    event.preventDefault();

    authAPI
      .login(this.state.email, this.state.password)
      .then(_response => {
        sessionStorage.setItem(constants.LOGIN_KEY, "true");
        this.props.history.push("/");
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Login</h1>

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

        <input type="submit" value="Submit" />
      </form>
    );
  }
}
