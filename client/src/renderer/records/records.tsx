import * as React from "react";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";
import { DispatchedProps } from "../app";
import { Layout } from "antd";
import "antd/dist/antd.css";
import { ColumnProps } from "../../../node_modules/antd/lib/table";

const { Content } = Layout;

type RecordListState  = {
  records: RecordItem[];
};

export class Records extends React.Component<DispatchedProps, RecordListState> {
  constructor(props: DispatchedProps) {
    super(props);
    this.state = {
      records: [],
    };
  }

  getAllRecords = () => {
    getAllForUser()
      .then(response => {
        if (response.statusCode === 200) {
          this.setState({
            records: JSON.parse(response.body).data as RecordItem[]
          });
        }

        if (response.statusCode === 401) {
          this.props.updateIsLoggedIn(undefined);
        }
      })
      .catch((error: string) => {
        console.error(error);
      });
  };

  componentDidMount() {
    this.getAllRecords();
  }

  tableColumns = (): Array<ColumnProps<RecordItem>> => {
    return [{
      title: "File",
      dataIndex: "name",
      key: "name",
      render: (text, record) => <Link to={`/records/details/${record.id}`}> {record.name} </Link>,
    },
    {
      title: "Actions",
      key: "action",
      render: (text) => <a href="javascript:;">Change permissions</a>,
    }];
  }

  render() {
    return (
      <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
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
          <Route path="/records/details/:record_id" render={({match}) => <DetailView {...this.props} match={match}/>} />
        </Switch>
        </div>
      </Content>
    );
  }
}
