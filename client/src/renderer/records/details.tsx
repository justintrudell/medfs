import * as React from "react";
import { RouteComponentProps } from "react-router";
import { get } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";

interface MatchParams {
  record_id: string;
}

interface DetailProps extends RouteComponentProps<MatchParams> {}

interface DetailState {
  recordDetails?: RecordDetails;
}

export class DetailView extends React.Component<DetailProps, DetailState> {
  constructor(props: DetailProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    get(this.props.match.params.record_id)
      .then(result => {
        if (result.statusCode === 200) {
          const recordDetails: RecordDetails = result.body.data;
          this.setState({ recordDetails });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  getToRender = (): JSX.Element => {
    if (!this.state.recordDetails || _.isEmpty(this.state.recordDetails)) {
      return <div />;
    }
    const pKeys = _.map(this.state.recordDetails, (value, key) => {
      return (
        <p key={key.toString()}>
          {key}: {value.toString()}
        </p>
      );
    });
    return (
      <div>
        {pKeys}
        <button> Download </button>
      </div>
    );
  };

  render() {
    return this.getToRender();
  }
}
