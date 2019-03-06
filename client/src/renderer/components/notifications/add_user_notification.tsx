import * as React from "react";
import { AddUserNotification } from "../../../models/notifications";
import { NotificationBaseView, NotificationBaseProps } from "./notification_base";
import { Button, Icon } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import { Link } from "react-router-dom";
import { respondToPatientRequest } from "../../../api/patients";

interface AddUserNotificationProps extends NotificationBaseProps {
  notification: AddUserNotification;
  isPreview: boolean;
  reload?(): void;
}


export class AddUserNotificationView extends NotificationBaseView<AddUserNotificationProps, {}> {
  constructor(props: AddUserNotificationProps) {
    super(props);
  }

  confirm = (): void => {
    const n = this.props.notification;
    respondToPatientRequest(n.content.doctorId, true, n.id).then(resp => {
      if (this.props.reload !== undefined) {
        this.props.reload();
      }
    }).catch(err => {
      console.error(err);
    });
  };

  decline = (): void => {
    const n = this.props.notification;
    respondToPatientRequest(n.content.doctorId, false, n.id).then(resp => {
      if (this.props.reload !== undefined) {
        this.props.reload();
      }
    }).catch(err => {
      console.error(err);
    });
  }

  getTitle(): string {
    return `${this.props.notification.content.doctorEmail} has added you as a patient.`;
  }

  getContent(): JSX.Element {
    const n = this.props.notification;

    if (n.content.acked) {
      if (n.content.accepted) {
        return (
          <div>
            <Icon type="check-circle" theme="filled" style={{ color: "#52c41a" }} /> Accepted
          </div>
        );
      }
      else {
        return (
          <div>
            <Icon type="close-circle" theme="filled" style={{ color: "#f5222d" }} /> Denied
          </div>
        );
      }
    }

    if (this.props.isPreview) {
      // too much effort to handle reloading the preview if they accept/decline the request
      // so just redirect to the notifications page so they can respond
      return (
        <Link to={`/notifications`}>
          View
        </Link>
      );
    }

    
    return (
      <div>
        <ButtonGroup>
          <Button type="primary" onClick={this.confirm}>Confirm</Button>
          <Button onClick={this.decline}>Decline</Button>
        </ButtonGroup>
      </div>
    );
  }
}
