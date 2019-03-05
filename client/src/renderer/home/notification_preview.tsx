import * as React from "react";
import { Link } from "react-router-dom";
import { Card, List } from "antd";
import { MedFsNotification, CreateNotification, NotificationType } from "../../models/notifications";

interface Props {
  notifications: MedFsNotification[];
}

export class NotificationPreview extends React.Component<Props, {}> {
  renderItem = (item: MedFsNotification) => {
    switch(item.notificationType) {
      case NotificationType.CREATE: {
        const n = item as CreateNotification;
        return (
          <List.Item>
            <Link to={`/records/details/${n.content.recordId}`}>
            {n.content.senderEmail} shared {n.content.filename} with you.
            </Link>
          </List.Item>
        );
      }
      default: {
        return (
          <List.Item>Unknown notification: {JSON.stringify(item)}</List.Item>
        );
      }
    }
  };

  render() {
    return (
      <div>
        <Card
          title="Notifications"
          size="small"
          style={{ width: 300, margin: 0, padding: 0 }}
        >
          <List
            dataSource={this.props.notifications}
            renderItem={this.renderItem}
          />
        </Card>
      </div>
    );
  }
}
