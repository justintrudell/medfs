import * as React from "react";
import { Layout, Icon } from "antd";
import "antd/dist/antd.css";

const { Header } = Layout;

export class MedFsHeader extends React.Component<{}, {}> {
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
          <h2>Page Title</h2>
        </div>
        <div
          style={{
            display: "inline-block",
            float: "right",
            fontSize: 20
          }}>
          <a><Icon type="notification" style={{ padding: 16 }} /></a>
          <a><Icon type="setting" style={{ padding: "16px 0 16px 16px" }} /></a>
        </div>
      </Header>
    );
  }
}
