import * as React from "react";
import { match } from "react-router";
import { get } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";
import { ipfsNode } from "../../ipfs/ipfsProvider";
import { writeFile } from "fs";
import { constants } from "../../config";
import { join } from "path";
import { IPFSFile } from "ipfs";
import { DispatchedProps } from "../app";

interface MatchParams {
  record_id: string;
}

interface DetailProps extends DispatchedProps {
  match: match<MatchParams>;
}

interface DetailState {
  recordDetails?: RecordDetails;
  downloadMessages: string[];
}

export class DetailView extends React.Component<DetailProps, DetailState> {
  constructor(props: DetailProps) {
    super(props);

    this.state = {
      downloadMessages: []
    };
  }

  componentDidMount() {
    get(this.props.match.params.record_id)
      .then(result => {
        if (result.statusCode === 200) {
          const recordDetails: RecordDetails = result.body.data;
          if (this.props.pageTitle !== recordDetails.filename) {
            this.props.setPageTitle(recordDetails.filename);
          }
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
          this.downloadFile(file);
        });
      })
      .catch(err => {
        this.setState({ downloadMessages: [err.message] });
      });
  };

  downloadFile = (file: IPFSFile): void => {
    if (file.content) {
      const filePath = join(
        constants.DOWNLOAD_PATH,
        this.state.recordDetails!.filename
      );
      writeFile(filePath, file.content, err => {
        if (err) {
          this.setState({ downloadMessages: [err.message] });
        } else {
          this.setState(prevState => ({
            downloadMessages: [
              ...prevState.downloadMessages,
              `Downloaded to ${filePath}`
            ]
          }));
        }
      });
    }
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
        <ul>
          {this.state.downloadMessages.map((message, idx) => {
            return <li key={idx}> {message} </li>;
          })}
        </ul>
      </div>
    );
  };

  render() {
    return this.getToRender();
  }
}
