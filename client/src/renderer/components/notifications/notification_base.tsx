import * as React from "react";
import { List, } from "antd";

export abstract class NotificationBaseView<P, S> extends React.Component<P, S> {
  abstract getContent(): void | string | JSX.Element;
  abstract getCreatedAtTime(): string;
  abstract getId(): string;
  abstract getTitle(): string | JSX.Element;

  render() {
    return (
      <List.Item key={this.getId()}>
        <List.Item.Meta
          title={this.getTitle()}
          description={this.getCreatedAtTime()}
        />
        {this.getContent()}
      </List.Item>
    );
  }
}
