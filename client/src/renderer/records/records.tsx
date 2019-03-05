import * as React from "react";
import * as _ from "lodash";
import { Card, Divider } from "antd";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";
import { updateIsLoggedIn, setPageTitle } from "../app";
import { Button } from "antd";
import { PermissionsModal } from "../components/modals/permissions";
import { ColumnProps } from "antd/lib/table";
import { ERR_NOT_AUTHORIZED, ERR_UNKNOWN, ERR_NO_PERM_FOR_RECORD } from "../../models/errors";
import { Permission, PermissionType } from "../../models/permissions";
import { getUsersForRecord } from "../../api/permissions";
import { getLogin } from "../../utils/loginUtils";
import { UserInternal } from "../../models/users";

export type RecordListState = {
  user: UserInternal | undefined;
  records: RecordItem[];
  canEditRecord: { [key: string]: boolean};
  permissionsModalVisible: boolean;
  currentRecord?: RecordItem;
  currentPermissions: Permission[];
  loading: boolean;
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
      user: undefined,
      records: [],
      canEditRecord: {},
      permissionsModalVisible: false,
      currentPermissions: [],
      loading: true
    };
  }

  getAllRecords = () => {
    Promise.all([getLogin(), getAllForUser()])
      .then(result => {
        if (!result[0] || _.isEmpty(result[0])) {
          throw new Error(ERR_UNKNOWN);
        }

        this.setState({
          user: result[0] as UserInternal,
          records: result[1] as RecordItem[],
          loading: false
        });

        // Check which permissions we have write access for
        this.state.records.forEach(record => {
          getUsersForRecord(record.id)
            .then(users => {
              const myPerm = users.filter(user => user.userEmail === this.state.user!.email);
              // Sanity check
              if(myPerm.length != 1) {
                throw new Error(ERR_NO_PERM_FOR_RECORD);
              }
              if(myPerm[0].permissionType === PermissionType.WRITE) {
                this.state.canEditRecord[record.id] = true;
              }
              else {
                this.state.canEditRecord[record.id] = false;
              }
            })
            .catch(() => {
              this.state.canEditRecord[record.id] = false;
            });
        });
      })
      .catch((error: Error) => {
        if (error.message === ERR_NOT_AUTHORIZED) {
          this.props.updateIsLoggedIn(undefined);
        }
        console.error(error);
        this.setState({ loading: false });
      });
    // getAllForUser()
    //   .then(records => {
    //     this.setState({ records, loading: false });

    //     const perms = Promise.all(records.map(record => getUsersForRecord(record.id)));
    //     getLogin().then(result => {
    //       var userEmail = result!.email;
    //       perms.then(allUsers => {
    //         const permissions = allUsers.map(users => users.filter(user => user.userEmail == userEmail)[0].permissionType)
    //         records.forEach((record, index) => {
    //           if(permissions[index] == PermissionType.WRITE) {
    //             this.state.canEditRecord[record.id] = true;
    //           }
    //         });
    //       });
    //     });
    //   })
    //   .catch((error: Error) => {
    //     if (error.message === ERR_NOT_AUTHORIZED) {
    //       this.props.updateIsLoggedIn(undefined);
    //     }
    //     console.error(error);
    //     this.setState({ loading: false });
    //   });
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
          return record.permissionedUsers.map(u => u.email).join(", ");
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
          <span style={{display: (this.state.canEditRecord[record.id]) ? "" : "none"}}>
            {/* TODO: add download link back once its functional */}
            {/* <a href="javascript:;">Download</a>
            <Divider type="vertical" /> */}
            <a
              href="javascript:;"
              onClick={() => this.showPermissionsModal(record)}
            >
              Edit Permissions
            </a>
            <Divider type="vertical" />
            <Link to={`/uploads/update/${record.id}`}> Update Record </Link>
          </span>
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
        <Switch>
          <Route exact path="/">
            <Card
              title="My Documents"
              loading={this.state.loading}
              extra={
                <Link to="/uploads">
                  <Button type="primary" icon="plus">
                    Add Document
                  </Button>
                </Link>
              }
            >
              <ListView
                items={this.state.records}
                columns={this.tableColumns()}
                keyProp="id"
                pageTitle={this.props.pageTitle}
                setPageTitle={this.props.setPageTitle}
              />
            </Card>
          </Route>

          <Route
            path="/records/details/:record_id"
            render={({ match }) => <DetailView {...this.props} match={match} />}
          />
        </Switch>
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
