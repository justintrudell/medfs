import * as React from "react";
import { Link } from "react-router-dom";
import { Layout, Icon, Badge, Menu, Dropdown } from "antd";
import "antd/dist/antd.css";
import { MedFsNotification } from "../../models/notifications";

const { Header } = Layout;

interface HeaderProps {
  notifications: MedFsNotification[];
  pageTitle?: string;
  clearNotifications: (visible?: boolean) => void;
}

export class MedFsHeader extends React.Component<HeaderProps, {}> {
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
          background: "none",
          borderBottom: "1px solid #e8e8e8"
        }}
      >
        <div
          style={{
            display: "inline-block",
            float: "left"
          }}
        >
          <h2>{this.props.pageTitle}</h2>
        </div>
        <div
          style={{
            display: "inline-block",
            float: "right",
            fontSize: 20
          }}
        >
          {this.notificationMenu()}
          <a>
            <Icon type="setting" style={{ margin: "16px 0 16px 16px" }} />
          </a>
        </div>
      </Header>
    );
  }
}
