import * as React from "react";
import { Link } from "react-router-dom";
import * as authAPI from "../../api/auth";
import { Error } from "../components/notifications/error";
import { Form, Icon, Input, Button, Layout, message } from "antd";

const { Content } = Layout;
const logo = require("../../image/logo.png");

type LoginState = {
  email: string;
  password: string;
  errorMessage: string;
};

interface LoginProps {
  loginCallback: (userInternal: UserInternal) => void;
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
        if (response.statusCode === 401) {
          this.setState({ errorMessage: "Please try again!" });
          return;
        } else if (response.statusCode === 200) {
          const userInternal: UserInternal = {
            email: this.state.email,
            userId: response.body.data.userId
          };
          message.success("Welcome!");
          this.props.loginCallback(userInternal);
        } else {
          console.log(response);
          message.error("Something went wrong!");
        }
      })
      .catch(errorMessage => {
        message.error(errorMessage);
      });
  }

  render() {
    return (
      <Content style={{ padding: "10% 50px", textAlign: "center"}}>
        <div style={{ width: 360, display: "inline-block" }} >
          <div style={{ padding: 12 }} >
            <img src={logo} style={{ width: 180 }} />
          </div>
          <div style={{ background: "#fff", padding: 24 }}>
            <h3>Log in</h3>
            <Form onSubmit={this.handleSubmit} className="login-form">
              <Form.Item>
                <Input
                  prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  id="email"
                  required />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  id="password"
                  required />
              </Form.Item>
              <Error errorMessage={this.state.errorMessage} />
              <Form.Item>
                <div>
                  <Button type="primary" htmlType="submit" className="login-form-button">
                    Log in
                  </Button>
                </div>
                Or <Link to="/signup">register now!</Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
    );
  }
}
