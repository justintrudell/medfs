import * as React from "react";
import { List, } from "antd";
import { MedFsNotification } from "../../../models/notifications";
import * as moment from "moment";

export interface NotificationBaseProps {
  notification: MedFsNotification;
}

export abstract class NotificationBaseView<P extends NotificationBaseProps, S> extends React.Component<P, S> {
  getContent(): void | string | JSX.Element {
    return;
  }

  getCreatedAtTime(): string {
    return moment(this.props.notification.createdAt).format("LLL");
  }

  getId(): string {
    return this.props.notification.id;
  }

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
