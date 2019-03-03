import * as React from "react";
import { Link } from "react-router-dom";
import { Card, List } from "antd";
import {
  StaticNotification,
  NotificationType
} from "../../models/notifications";
import { getNotifications } from "../../api/users";

interface State {
  notifications: StaticNotification[];
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

  renderItem = (item: StaticNotification) => {
    // TODO: each notification type could be its own component
    if (item.notificationType === NotificationType.CREATE) {
      const itemDetails = item.content as {
        recordId: string;
        email: string;
        filename: string;
      };
      return (
        <List.Item>
          {/* TODO: refactor this wording once we have more granular notifications*/}
          {/* TODO: add datetime here*/}
          <Link to={`/records/details/${itemDetails.recordId}`}>
            {itemDetails.email} shared {itemDetails.filename} with you at{" "}
            {item.createdAt.toISOString()}
          </Link>
        </List.Item>
      );
    } else {
      return (
        <List.Item>Unknown notification: {JSON.stringify(item)}</List.Item>
      );
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
