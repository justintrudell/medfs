import * as React from "react";
import { HistoryProps } from "../app";
import { Icon } from "antd";

export class BackButton extends React.Component<HistoryProps, {}> {
  constructor(props: HistoryProps) {
    super(props);
  }

  render() {
    return (
      <span className="ant-menu-item">
        <Icon type="rollback" />
      </span>
    );
  }
}
