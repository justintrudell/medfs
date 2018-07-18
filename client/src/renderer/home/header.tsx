import * as React from "react";
import { Layout, Icon, Badge } from "antd";
import "antd/dist/antd.css";
import { DispatchedProps } from "../app";

const { Header } = Layout;

export class MedFsHeader extends React.Component<DispatchedProps, {}> {
  // TODO: figure out how to pass the title down in the state (@vfkou teach me the ways)
  // TODO: set up notifcations to use message service
  // TODO: set up setting pages
  render() {
    return (
      <Header style={{
        background: "none",
        borderBottom: "1px solid #e8e8e8"
      }}>
        <div
          style={{
            display: "inline-block",
            float: "left",
          }}>
          <h2>{this.props.pageTitle}</h2>
        </div>
        <div
          style={{
            display: "inline-block",
            float: "right",
            fontSize: 20
          }}>
          <Badge dot>
            <a><Icon type="notification" /></a>
          </Badge>
          <a><Icon type="setting" style={{ margin: "16px 0 16px 16px" }} /></a>
        </div>
      </Header>
    );
  }
}
