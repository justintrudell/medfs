import * as React from "react";
import * as _ from "lodash";
import * as userAPI from "../../api/users";
import { Error } from "../components/notifications/error";
import { Form, Icon, Input, Button, Layout, message } from "antd";
import { Link } from "react-router-dom";
import { HistoryProps } from "../app";

const { Content } = Layout;
const logo = require("../../image/logo.png");

type State = {
  email: string;
  password: string;
  confirmPassword: string;
  errorMessage: string;
};

export class Signup extends React.Component<HistoryProps, State> {
  constructor(props: HistoryProps) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      errorMessage: ""
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
      this.setState({ errorMessage: "Passwords don't match" });
      return false;
    }

    if (_.isEmpty(this.state.email) || _.isEmpty(this.state.password)) {
      this.setState({ errorMessage: "Please fill out all fields" });
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
        if (response.statusCode === 201) {
          message.success("Success!");
          this.props.history.push("/");
        } else {
          message.error("Something went wrong.");
          console.log(response);
        }
      })
      .catch(error => {
        message.error(error);
        console.log(error);
      });
  }

  render() {
    return (
      <Content style={{ padding: "8% 50px", textAlign: "center" }}>
        <div style={{ width: 360, display: "inline-block" }}>
          <div style={{ padding: 12 }}>
            <img src={logo} style={{ width: 180 }} />
          </div>
          <div style={{ background: "#fff", padding: 24 }}>
            <h3>Register</h3>
            <Form onSubmit={this.handleSubmit} className="login-form">
              <Form.Item>
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="text"
                  placeholder="Enter Email"
                  id="email"
                  required
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="Enter Password"
                  id="password"
                  required
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="Repeat Password"
                  id="confirmPassword"
                  required
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                />
              </Form.Item>
              <Error errorMessage={this.state.errorMessage} />
              <Form.Item>
                <div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Submit
                  </Button>
                </div>
                <Link to="/">Back to login</Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
    );
  }
}
