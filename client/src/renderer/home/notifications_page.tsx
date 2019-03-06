import * as React from "react";
import { Card, List } from "antd";
import {
  MedFsNotification,
  NotificationType,
  CreateNotification,
  AddUserNotification
} from "../../models/notifications";
import { getNotifications } from "../../api/users";
import { CreateNotificationView } from "../components/notifications/create_notification";
import { AddUserNotificationView } from "../components/notifications/add_user_notification";

interface State {
  notifications: MedFsNotification[];
  loading: boolean;
}

export class NotificationsPage extends React.Component<{}, State> {
  state = { loading: true, notifications: [] };
  constructor(props: {}) {
    super(props);

    this.loadNotifications = this.loadNotifications.bind(this);
  }

  loadNotifications(): void {
    getNotifications()
      .then(notifications => {
        this.setState({ notifications, loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
        console.error(err);
      });
  }

  componentDidMount = () => {
    this.loadNotifications();
  };

  renderItem = (item: MedFsNotification) => {
    // TODO: each notification type could be its own component
    switch (item.notificationType) {
      case NotificationType.CREATE: {
        return <CreateNotificationView notification={item as CreateNotification} />;
      }
      case NotificationType.ADD_USER: {
        return <AddUserNotificationView
          notification={item as AddUserNotification}
          isPreview={false}
          reload={this.loadNotifications}
        />;
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
      <Card title="Notifications" loading={this.state.loading}>
        <List
          dataSource={this.state.notifications}
          renderItem={this.renderItem}
        />
      </Card>
    );
  }
}
