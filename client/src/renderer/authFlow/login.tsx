import * as React from "react";
import * as authAPI from "../../api/auth";
import { constants } from "../../config";
import { Error } from "../components/notifications/error";

type LoginState = {
  email: string;
  password: string;
  errorMessage?: string;
};

interface LoginProps {
  history?: string[];
  loginCallback: (isLoggedIn: boolean) => void;
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errorMessage: ""
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
      .then(response => {
        if (response.statusCode == 401) {
          this.setState({ errorMessage: "Please try again" });
          return;
        } else if (response.statusCode == 200) {
          this.props.loginCallback(true);
          sessionStorage.setItem(constants.LOGIN_KEY, "true");
        } else {
          console.log(response);
          this.setState({ errorMessage: "Something went wrong" });
        }
      })
      .catch(errorMessage => {
        this.setState({ errorMessage });
      });
  }

  render() {
    return (
      <div>
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
        <Error errorMessage={this.state.errorMessage} />
      </div>
    );
  }
}
