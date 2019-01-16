import * as React from "react";
import { Link } from "react-router-dom";
import { Layout, Icon, Badge, Menu, Dropdown } from "antd";
import "antd/dist/antd.css";
import { MedFsNotification } from "../../models/notifications";
import { HistoryProps } from "../app";
import { Row, Col } from "antd";

const { Header } = Layout;
const logo = require("../../image/logo_white.png");

interface HeaderProps {
  notifications: MedFsNotification[];
  pageTitle?: string;
  clearNotifications: (visible?: boolean) => void;
}

export class MedFsHeader extends React.Component<
  HeaderProps & HistoryProps,
  {}
> {
  getKey = (item: MedFsNotification): string => {
    return item.recordId;
  };

  getName = (item: MedFsNotification): string => {
    return item.name;
  };

  notificationMenu() {
    // TODO: do something with the private keys
    const menuItems = (
      <Menu>
        {this.props.notifications.map(item => {
          return (
            <Menu.Item key={this.getKey(item)}>
              <Link to={`/records/details/${this.getKey(item)}`}>
                New file shared: {this.getName(item)}
              </Link>
            </Menu.Item>
          );
        })}
      </Menu>
    );

    return (
      <Dropdown
        overlay={menuItems}
        trigger={["click"]}
        onVisibleChange={this.props.clearNotifications}
      >
        <Badge dot={this.props.notifications.length > 0}>
          <a>
            <Icon type="notification" />
          </a>
        </Badge>
      </Dropdown>
    );
  }

  render() {
    return (
      <Header
        style={{
          position: "fixed",
          zIndex: 1,
          width: "100%",
          marginBottom: "12px"
        }}
      >
        <Row type="flex" align="middle">
          <Col span={2}>
            <div className="logo">
              <img src={logo} style={{ width: 40 }} />
            </div>
          </Col>
          <Col span={20}>
            <Menu
              theme="dark"
              mode="horizontal"
              selectable={false}
              selectedKeys={[]}
            >
              <Menu.Item key="back_button">
                <div
                  onClick={() => {
                    this.props.history.goBack();
                  }}
                >
                  <Icon type="left" />
                </div>
              </Menu.Item>
              <Menu.Item key="home">
                <Link to="/">
                  <Icon type="home" />
                  <span className="nav-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="uploads">
                <Link to="/uploads">
                  <Icon type="file-add" />
                  <span className="nav-text">Uploads</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="settings">
                <Icon type="setting" />
                <span className="nav-text">Settings</span>
              </Menu.Item>
            </Menu>
          </Col>
          <Col span={2}>{this.notificationMenu()}</Col>
        </Row>
      </Header>
    );
  }
}
