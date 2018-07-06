import * as React from "react";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";

type RecordListState = {
  records: RecordItem[];
};

export class Records extends React.Component<{}, RecordListState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      records: []
    };
  }

  getAllRecords = () => {
    getAllForUser()
      .then(response => {
        if (response.statusCode == 200) {
          this.setState({
            records: JSON.parse(response.body).data as RecordItem[]
          });
        }
      })
      .catch((error: string) => {
        console.error(error);
      });
  };

  componentWillMount() {
    this.getAllRecords();
  }

  keyFunc = (arg: RecordItem): string => {
    return arg.id;
  };

  renderFunc = (arg: RecordItem): JSX.Element => {
    return <Link to={`/records/details/${arg.id}`}> {arg.name} </Link>;
  };

  render() {
    return (
      <div>
        <h1> Homepage </h1>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <ListView
                items={this.state.records}
                getKey={this.keyFunc}
                renderFunc={this.renderFunc}
              />
            )}
          />
          <Route path="/records/details/:acl_id" component={DetailView} />
        </Switch>
      </div>
    );
  }
}
