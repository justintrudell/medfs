import * as React from "react";
const authAPI = require("../api/auth");
const { remote } = require("electron");
const cookieParser = require("set-cookie-parser");
const { config } = require("../config");

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
      (error: any, response: any, body: any) => {
        const cookies = cookieParser.parse(response);
        if (remote.session.defaultSession) {
          const sessionCookie = cookies.find((element: any) => element["name"] === "session");
          const toAdd = {
            url: config.RECORD_SERVICE_ENDPOINT,
            name: sessionCookie["name"],
            value: sessionCookie["value"]
          };
          remote.session.defaultSession.cookies.set(toAdd, (error) => {
            console.log(error);
          });
        } else {
          // TODO: propagate errors to client
          console.log("Unable to access default session");
        }
      }
    );
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
