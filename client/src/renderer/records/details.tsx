import * as React from "react";
import { RouteComponentProps } from "react-router";
import { get } from "../../api/records";

interface MatchParams {
  record_id: string;
}

interface DetailProps extends RouteComponentProps<MatchParams> {}

export class DetailView extends React.Component<DetailProps, {}> {
  constructor(props: DetailProps) {
    super(props);
  }

  componentWillMount() {
    get(this.props.match.params.record_id)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <p> {this.props.match.params.record_id} </p>
        <button> Download </button>
      </div>
    );
  }
}
