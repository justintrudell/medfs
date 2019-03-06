import * as React from "react";
import { Link } from "react-router-dom";
import { CreateNotification } from "../../../models/notifications";
import { NotificationBaseView } from "./notification_base";
import * as moment from "moment";

interface CreateNotificationProps {
  notification: CreateNotification;
}

export class CreateNotificationView extends NotificationBaseView<CreateNotificationProps, {}> {
  constructor(props: CreateNotificationProps) {
    super(props);
  }

  getId(): string {
    return this.props.notification.id;
  }

  getTitle(): JSX.Element {
    const n = this.props.notification;
    return (
      <Link to={`/records/details/${n.content.recordId}`}>
        {n.content.senderEmail} shared {n.content.filename} with you.
      </Link>
    );
  }

  getContent(): void {}

  getCreatedAtTime(): string {
    return moment(this.props.notification.createdAt).format("LLL");
  }


}
