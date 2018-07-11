import * as React from "react";
import { RouteComponentProps } from "react-router";
import { get } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";
import { ipfsNode } from "../../ipfs/ipfsProvider";
import { writeFile } from "fs";
import { constants } from "../../config";
import { join } from "path";

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

  downloadRecord = () => {
    if (!this.state.recordDetails || _.isEmpty(this.state.recordDetails)) {
      return;
    }

    ipfsNode.files
      .get(this.state.recordDetails.hash)
      .then(result => {
        result.forEach(file => {
          if (file.content) {
            const filePath = join(
              constants.DOWNLOAD_PATH,
              this.state.recordDetails!.filename
            );
            writeFile(filePath, file.content, err => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  };

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
        <button onClick={this.downloadRecord}> Download </button>
      </div>
    );
  };

  render() {
    return this.getToRender();
  }
}
