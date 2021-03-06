import * as React from "react";
import { Link } from "react-router-dom";
import { UpdateNotification } from "../../../models/notifications";
import { NotificationBaseView, NotificationBaseProps } from "./notification_base";

interface UpdateNotificationProps extends NotificationBaseProps {
  notification: UpdateNotification;
}

export class UpdateNotificationView extends NotificationBaseView<UpdateNotificationProps, {}> {
  constructor(props: UpdateNotificationProps) {
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
    return `${n.content.senderEmail} updated ${n.content.filename}.`;
  }
}
