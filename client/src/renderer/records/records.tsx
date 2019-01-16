import * as React from "react";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";
import { updateIsLoggedIn, setPageTitle } from "../app";
import { Layout, Button } from "antd";
import { PermissionsModal } from "../components/modals/permissions";
import { ColumnProps } from "antd/lib/table";
import { ERR_NOT_AUTHORIZED } from "../../models/errors";
import { Permission } from "../../models/permissions";
import { getUsersForRecord } from "../../api/permissions";

const { Content } = Layout;

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
        title: "Actions",
        key: "action",
        render: (_, record) => (
          <Button onClick={() => this.showPermissionsModal(record)}>
            Change permissions
          </Button>
        )
      },
      {
        title: "Created At",
        key: "created_at",
        render: (_, record) => record.created.toLocaleString("en-US"),
        sorter: (a: RecordItem, b: RecordItem) =>
          a.created.getTime() - b.created.getTime()
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
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          height: "85vh"
        }}
      >
        <div>
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
        </div>
        <PermissionsModal
          visible={this.state.permissionsModalVisible}
          record={this.state.currentRecord}
          permissions={this.state.currentPermissions}
          hideModalCallback={this.hidePermissionsModal}
        />
      </Content>
    );
  }
}
