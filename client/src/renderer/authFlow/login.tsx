import * as React from "react";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import * as authAPI from "../../api/auth";
import { Error as ErrorComponent } from "../components/notifications/error";
import { Form, Icon, Input, Button, Layout, message } from "antd";
import { UserInternal } from "../../models/users";
import { ERR_NOT_AUTHORIZED } from "../../models/errors";

const { Content } = Layout;
const logo = require("../../image/logo.png");

type LoginState = {
  email: string;
  password: string;
  errorMessage: string;
  loading: boolean;
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
      errorMessage: "",
      loading: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (stateItem: "email" | "password") => (
    event: React.FormEvent<EventTarget>
  ) => {
    const target = event.target as HTMLInputElement;
    const toAdd = { ...this.state, [stateItem]: target.value };
    this.setState(toAdd);
  };

  handleSubmit(event: React.FormEvent<EventTarget>) {
    event.preventDefault();
    this.setState({ loading: true });
    authAPI
      .login(this.state.email, this.state.password)
      .then(loginDetails => {
        authAPI
          .decryptPk(loginDetails.privateKey, this.state.password)
          .then(decryptedPk => {
            const userInternal: UserInternal = {
              email: this.state.email,
              userId: loginDetails.userId,
              privateKey: decryptedPk
            };
            this.setState({ loading: false });
            this.props.loginCallback(userInternal);
          })
      })
      .catch((error: Error) => {
        if (error.message === ERR_NOT_AUTHORIZED) {
          message.error("Invalid username/password");
        } else {
          message.error(error.toString());
        }
        this.setState({ loading: false });
      });
  }

  render() {
    if (this.state.loading) {
      return (
        <Content style={{ padding: "10% 50px", textAlign: "center" }}>
          <div style={{ width: 360, display: "inline-block" }}>
            <div style={{ padding: 12 }}>
              <img src={logo} style={{ width: 180 }} />
            </div>
            <div style={{ background: "#fff", padding: 24 }}>
              <Spin />
            </div>
          </div>
        </Content>
      );
    }

    return (
      <Content style={{ padding: "10% 50px", textAlign: "center" }}>
        <div style={{ width: 360, display: "inline-block" }}>
          <div style={{ padding: 12 }}>
            <img src={logo} style={{ width: 180 }} />
          </div>
          <div style={{ background: "#fff", padding: 24 }}>
            <h3>Log in</h3>
            <Form onSubmit={this.handleSubmit} className="login-form">
              <Form.Item>
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.handleChange("email")}
                  id="email"
                  required
                />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChange("password")}
                  id="password"
                  required
                />
              </Form.Item>
              <ErrorComponent errorMessage={this.state.errorMessage} />
              <Form.Item>
                <div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
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
