import * as React from "react";

import { Card, List } from "antd";
import { MedFsNotification, CreateNotification, NotificationType, AddUserNotification } from "../../models/notifications";
import { CreateNotificationView } from "../components/notifications/create_notification";
import { AddUserNotificationView } from "../components/notifications/add_user_notification";

interface Props {
  notifications: MedFsNotification[];
}

export class NotificationPreview extends React.Component<Props, {}> {
  renderItem = (item: MedFsNotification) => {
    switch(item.notificationType) {
      case NotificationType.CREATE: {
        const n = item as CreateNotification;
        return <CreateNotificationView notification={n} />;
      }
      case NotificationType.ADD_USER: {
        const n = item as AddUserNotification;
        return <AddUserNotificationView notification={n} isPreview={true} />;
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
          style={{ minWidth: 300, margin: 0, padding: 0 }}
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
