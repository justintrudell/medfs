import * as React from "react";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";
import { updateIsLoggedIn, setPageTitle } from "../app";
import { Layout } from "antd";
import { ColumnProps } from "antd/lib/table";
import { ERR_NOT_AUTHORIZED } from "../../models/errors";

const { Content } = Layout;

type RecordListState = {
  records: RecordItem[];
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
      records: []
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
        render: _ => <a href="javascript:;">Change permissions</a>
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

  render() {
    return (
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          minHeight: 280
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
      </Content>
    );
  }
}
