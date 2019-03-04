import * as React from "react";
import { Link } from "react-router-dom";
import { Card, List } from "antd";
import { MedFsNotification } from "../../models/notifications";

interface Props {
  notifications: MedFsNotification[];
}

export class NotificationPreview extends React.Component<Props, {}> {
  renderItem = (item: MedFsNotification) => {
    return (
      <List.Item>
        {/* TODO: refactor this wording once we have more granular notifications*/}
        <Link to={`/records/details/${item.recordId}`}>
          {item.senderEmail} shared {item.filename} with you
        </Link>
      </List.Item>
    );
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
