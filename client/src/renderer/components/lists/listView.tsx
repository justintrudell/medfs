import * as React from "react";
import { Table, Empty } from "antd";
import { ColumnProps } from "antd/lib/table";

interface ListViewProps<T> {
  columns?: Array<ColumnProps<T>>;
  keyProp?: string;
  items: T[];
  pageTitle?: string;
  setPageTitle: (title?: string) => void;
}

export class ListView<T> extends React.Component<ListViewProps<T>, {}> {
  componentDidMount() {
    if (this.props.pageTitle !== "Home") {
      this.props.setPageTitle("Home");
    }
  }

  render() {
    if (!this.props.items.length) {
      return <Empty description="No documents found." />;
    }
    return (
      <Table
        rowKey={this.props.keyProp}
        columns={this.props.columns}
        dataSource={this.props.items}
        pagination={{ pageSize: 7 }}
      />
    );
  }
}
