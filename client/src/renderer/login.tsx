import * as React from "react";
const authAPI = require("../api/auth");
const { constants } = require("../config");

type LoginState = {
  email: string,
  password: string
};

export default class extends React.Component<any, LoginState> {

  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    const toAdd = {
      [event.target.id]: event.target.value
    } as LoginState;
    this.setState(toAdd);
  }

  handleSubmit(event: any) {
    event.preventDefault();

    authAPI.login(this.state.email, this.state.password,
      (_error: any, _response: Response, _body: any) => {
        sessionStorage.setItem(constants.LOGIN_KEY, "true");
        this.props.history.push("/");
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h1>Login</h1>

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

        <input type="submit" value="Submit" />
      </form>
    );
  }
}
