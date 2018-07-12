import * as React from "react";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";
import { Switch, Route, Link } from "react-router-dom";
import { DetailView } from "./details";
import { ListView } from "../components/lists/listView";
import { DispatchedProps } from "../app";

type RecordListState = {
  records: RecordItem[];
};

export class Records extends React.Component<DispatchedProps, RecordListState> {
  constructor(props: DispatchedProps) {
    super(props);
    this.state = {
      records: []
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
          <Route path="/records/details/:record_id" component={DetailView} />
        </Switch>
      </div>
    );
  }
}
