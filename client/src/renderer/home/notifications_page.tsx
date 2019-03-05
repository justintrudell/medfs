import * as React from "react";
import { Link } from "react-router-dom";
import { Card, List } from "antd";
import {
  MedFsNotification,
  NotificationType,
  CreateNotification
} from "../../models/notifications";
import { getNotifications } from "../../api/users";

interface State {
  notifications: MedFsNotification[];
  loading: boolean;
}

export class NotificationsPage extends React.Component<{}, State> {
  state = { loading: true, notifications: [] };

  componentDidMount = () => {
    getNotifications()
      .then(notifications => {
        this.setState({ notifications, loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
        console.error(err);
      });
  };

  renderItem = (item: MedFsNotification) => {
    // TODO: each notification type could be its own component
    switch (item.notificationType) {
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
      <Card title="Notifications" loading={this.state.loading}>
        <List
          dataSource={this.state.notifications}
          renderItem={this.renderItem}
        />
      </Card>
    );
  }
}
