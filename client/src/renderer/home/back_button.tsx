import * as React from "react";
import { HistoryProps } from "../app";
import { Icon } from "antd";

export class BackButton extends React.Component<HistoryProps, {}> {
  constructor(props: HistoryProps) {
    super(props);
  }

  render() {
    return (
      <div
        onClick={this.props.history.goBack}
        style={{
          display: "inline-block",
          float: "left",
          paddingRight: 8,
          fontSize: 18
        }}
        className="ant-menu-dark"
      >
        <span style={{ padding: 0 }} className="ant-menu-item">
          <Icon type="rollback" />
        </span>
      </div>
    );
  }
}
