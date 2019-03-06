import * as React from "react";
import { Link } from "react-router-dom";
import { CreateNotification } from "../../../models/notifications";
import { NotificationBaseView, NotificationBaseProps } from "./notification_base";

interface CreateNotificationProps extends NotificationBaseProps {
  notification: CreateNotification;
}

export class CreateNotificationView extends NotificationBaseView<CreateNotificationProps, {}> {
  constructor(props: CreateNotificationProps) {
    super(props);
  }

  getContent(): JSX.Element {
    return (
      <Link to={`/records/details/${this.props.notification.content.recordId}`}>
        View
      </Link>
    );
  }

  getId(): string {
    return this.props.notification.id;
  }

  getTitle(): string {
    const n = this.props.notification;
    return `${n.content.senderEmail} shared ${n.content.filename} with you.`;
  }
}
