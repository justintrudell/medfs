import * as React from "react";
import { Link } from "react-router-dom";
import { Layout, Icon, Badge, Menu, Dropdown, Button } from "antd";
import "antd/dist/antd.css";
import { MedFsNotification } from "../../models/notifications";
import { HistoryProps } from "../app";
import * as _ from "lodash";
import { NotificationPreview } from "./notification_preview";

const { Header } = Layout;
const logo = require("../../image/logo_white.png");

interface HeaderProps {
  notifications: MedFsNotification[];
  pageTitle?: string;
  clearNotifications: (visible?: boolean) => void;
  isDoctor: () => boolean;
  logout: () => void;
}

export class MedFsHeader extends React.Component<
  HeaderProps & HistoryProps,
  {}
> {
  notificationMenu() {
    return (
      <Dropdown
        overlay={
          <Menu style={{ padding: 0 }}>
            <Menu.Item style={{ padding: 0 }}>
              <NotificationPreview notifications={this.props.notifications} />
            </Menu.Item>
            <Menu.Item>
              <Link to={`/notifications`}>
                <Button type="primary">See All</Button>
              </Link>
            </Menu.Item>
          </Menu>
        }
        trigger={["click"]}
        onVisibleChange={this.props.clearNotifications}
      >
        <Badge dot={this.props.notifications.length > 0}>
          <a href="#">
            <Icon
              type="inbox"
              style={{
                color: "#fff",
                padding: "8px",
                border: " 1px solid #fff",
                fontSize: "24px",
                borderRadius: "100%"
              }}
            />
          </a>
        </Badge>
      </Dropdown>
    );
  }

  settingsMenu() {
    const menuItems = (
      <Menu
        style={{ minWidth: "100px", borderRadius: "0px", textAlign: "center" }}
      >
        <Menu.Item key="settings">
          <Link to="/settings">
            <span className="nav-text">Settings</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="logout">
          <div
            onClick={() => {
              this.props.logout();
            }}
          >
            <span className="nav-text">Logout</span>
          </div>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown
        overlay={menuItems}
        trigger={["click"]}
        placement={"bottomCenter"}
      >
        <Icon
          type="user"
          style={{
            color: "#fff",
            padding: "8px",
            border: " 1px solid #fff",
            fontSize: "24px",
            borderRadius: "100%"
          }}
        />
      </Dropdown>
    );
  }

  patientsMenuItem() {
    if (!this.props.isDoctor()) {
      return (
        <Menu.Item key="doctors">
          {/* TODO CHANGE THIS ONCE WE MAKE THE PATIENT VIEW */}
          <Link to="/doctors">
            <span className="nav-text">Doctors</span>
          </Link>
        </Menu.Item>
      );
    }

    return (
      <Menu.Item key="patients">
        {/* TODO CHANGE THIS ONCE WE MAKE THE PATIENT VIEW */}
        <Link to="/patients">
          <span className="nav-text">Patients</span>
        </Link>
      </Menu.Item>
    );
  }

  dashboardMenuItem() {
    return (
      <Menu.Item key="home">
        <Link to="/">
          <span className="nav-text">Dashboard</span>
        </Link>
      </Menu.Item>
    );
  }

  render() {
    return (
      <Header
        style={{
          marginBottom: "12px"
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[]}
          selectable={false}
          style={{ lineHeight: "64px", position: "fixed", zIndex: 1 }}
          inlineIndent={0}
        >
          <Menu.Item key="dashboard">
            <div>
              <div
                onClick={() => {
                  this.props.history.goBack();
                }}
                style={{
                  display: "inline-block",
                  float: "left",
                  paddingRight: "16px"
                }}
              >
                <Icon type="left" />
              </div>

              <div className="logo" style={{ display: "inline-block" }}>
                <Link to="/">
                  <img src={logo} style={{ width: 80 }} />
                </Link>
              </div>
            </div>
          </Menu.Item>

          {this.dashboardMenuItem()}

          {this.patientsMenuItem()}
        </Menu>

        <div
          style={{
            display: "inline-block",
            float: "right",
            margin: "4px 0 0 6px"
          }}
        >
          {this.settingsMenu()}
        </div>

        <div
          style={{
            display: "inline-block",
            float: "right",
            margin: "4px 6px 0 0"
          }}
        >
          {this.notificationMenu()}
        </div>
      </Header>
    );
  }
}
