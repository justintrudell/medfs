import * as React from "react";
import { Card, Row, Col } from "antd";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";
import { updateIsLoggedIn, setPageTitle } from "../app";
import { Button } from "antd";
import { PermissionsModal } from "../components/modals/permissions";
import { ColumnProps } from "antd/lib/table";
import { ERR_NOT_AUTHORIZED } from "../../models/errors";
import { Permission } from "../../models/permissions";
import { getUsersForRecord } from "../../api/permissions";

type RecordListState = {
  records: RecordItem[];
  permissionsModalVisible: boolean;
  currentRecord?: RecordItem;
  currentPermissions: Permission[];
};

export interface RecordProps {
  updateIsLoggedIn: updateIsLoggedIn;
  setPageTitle: setPageTitle;
  pageTitle?: string;
}

export class Records extends React.Component<RecordProps, RecordListState> {
  constructor(props: RecordProps) {
    super(props);
    this.state = {
      records: [],
      permissionsModalVisible: false,
      currentPermissions: []
    };
  }

  getAllRecords = () => {
    getAllForUser()
      .then(records => this.setState({ records }))
      .catch((error: Error) => {
        if (error.message === ERR_NOT_AUTHORIZED) {
          this.props.updateIsLoggedIn(undefined);
        }
        console.error(error);
      });
  };

  componentDidMount() {
    this.getAllRecords();
  }

  tableColumns = (): Array<ColumnProps<RecordItem>> => {
    return [
      {
        title: "File",
        dataIndex: "name",
        key: "name",
        render: (_, record) => (
          <Link to={`/records/details/${record.id}`}> {record.name} </Link>
        ),
        sorter: (a: RecordItem, b: RecordItem) => a.name.localeCompare(b.name)
      },
      {
        title: "Shared With",
        dataIndex: "shared_with",
        key: "shared_with",
        render: (_, record) => {
          return record.permissionedUsers.map(u => u.email).toString();
        }
      },
      {
        title: "Created At",
        key: "created_at",
        render: (_, record) => record.created.toLocaleString("en-US"),
        sorter: (a: RecordItem, b: RecordItem) =>
          a.created.getTime() - b.created.getTime()
      },
      {
        title: "Actions",
        key: "action",
        render: (_, record) => (
          <Row type="flex" justify="start" align="middle">
            <Col span={3}>
              <Button
                type="primary"
                shape="circle"
                icon="download"
                size="small"
              />
            </Col>
            <Col span={5}>
              <Button onClick={() => {}}>Edit</Button>
            </Col>
            <Col span={5}>
              <Button onClick={() => this.showPermissionsModal(record)}>
                Change permissions
              </Button>
            </Col>
          </Row>
        )
      }
    ];
  };

  showPermissionsModal = (record: RecordItem) => {
    getUsersForRecord(record.id)
      .then((permissions: Permission[]) => {
        this.setState({
          permissionsModalVisible: true,
          currentRecord: record,
          currentPermissions: permissions
        });
      })
      .catch((error: Error) => {
        console.log(error);
      });
  };

  hidePermissionsModal = (): void => {
    this.setState({
      permissionsModalVisible: false,
      currentPermissions: []
    });
  };

  render() {
    return (
      <div>
        <div>
          <Card title="My Documents">
            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <ListView
                    items={this.state.records}
                    columns={this.tableColumns()}
                    keyProp="id"
                    pageTitle={this.props.pageTitle}
                    setPageTitle={this.props.setPageTitle}
                  />
                )}
              />
              <Route
                path="/records/details/:record_id"
                render={({ match }) => (
                  <DetailView {...this.props} match={match} />
                )}
              />
            </Switch>
          </Card>
        </div>
        <PermissionsModal
          visible={this.state.permissionsModalVisible}
          record={this.state.currentRecord}
          permissions={this.state.currentPermissions}
          hideModalCallback={this.hidePermissionsModal}
        />
      </div>
    );
  }
}
