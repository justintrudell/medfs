import * as React from "react";
import { Link } from "react-router-dom";
import { Logout } from "../authFlow/logout";
import { DispatchedProps } from "../app";
import { BackButton } from "./back_button";
import { Layout, Menu, Icon } from "antd";

const { Sider } = Layout;
const logo = require("../../image/logo_white.png");

export class Header extends React.Component<DispatchedProps, {}> {
  render() {
    return (
      <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
        <div className="logo" style={{ padding: 24, textAlign: "center" }} >
          <BackButton {...this.props} />
          <img src={logo} style={{ width: 90 }} />
        </div>
        <Menu theme="dark" mode="inline" selectable={false}>
          <Menu.Item key="home">
            <Link to="/">
              <Icon type="home" /><span className="nav-text">Home</span>
            </Link>
          </Menu.Item>
        </Menu>
        <Logout {...this.props} />
      </Sider>
    );
  }
}
