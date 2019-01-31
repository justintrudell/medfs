import * as React from "react";
import { match } from "react-router";
import { Link } from "react-router-dom";
import { get } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";
import { downloadRecord } from "../../utils/recordUtils"
import { copyFile } from "fs";
import { constants } from "../../config";
import { join } from "path";
import { setPageTitle } from "../app";
import { Button, Table, Alert } from "antd";

export interface MatchParams {
  record_id: string;
}

interface DetailProps {
  match: match<MatchParams>;
  setPageTitle: setPageTitle;
  pageTitle?: string;
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
      .then(recordDetails => {
        if (this.props.pageTitle !== recordDetails.filename) {
          this.props.setPageTitle(recordDetails.filename);
        }
        this.setState({ recordDetails });
      })
      .catch(error => {
        console.error(error);
      });
  }

  saveRecordToDownloads = () => {
    if (!this.state.recordDetails || _.isEmpty(this.state.recordDetails)) {
      return;
    }
    downloadRecord(this.state.recordDetails.hash, this.state.recordDetails.id)
      .then(tmpFile => {
        const downloadsFilePath = join(
          constants.DOWNLOAD_PATH,
          this.state.recordDetails!.filename
        );
        copyFile(tmpFile.path, downloadsFilePath, (err) => {
          if (err) {
            this.setState({ downloadMessages: [err.message] });
          }
          tmpFile.cleanup();
          this.setState(prevState => ({
            downloadMessages: [
              ...prevState.downloadMessages,
              `Downloaded to ${downloadsFilePath}`
            ]
          }));
        });
      })
      .catch(err => {
        this.setState({ downloadMessages: [err.message] });
      });
  }

  getToRender = (): JSX.Element => {
    if (!this.state.recordDetails || _.isEmpty(this.state.recordDetails)) {
      return <div />;
    }
    const pKeys = _.map(
      this.state.recordDetails,
      (value, key): { key: string; attribute: string; value: string } => {
        return {
          key: key.toString(),
          attribute: key.toString(),
          value: value.toString()
        };
      }
    );

    const columns = [
      {
        title: "Attribute",
        dataIndex: "attribute",
        key: "attribute"
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value"
      }
    ];

    return (
      <div>
        <Table columns={columns} dataSource={pKeys} pagination={false} />
        <Button
          style={{ marginTop: 24 }}
          type="primary"
          icon="download"
          onClick={this.saveRecordToDownloads}
        >
          Download
        </Button>
        <Link to={`/records/preview/${this.state.recordDetails.id}`}>Preview</Link>
        {this.state.downloadMessages.map((message, idx) => {
          return (
            <Alert
              key={idx}
              style={{ marginTop: 12 }}
              message={message}
              type="info"
              closeText="Close Now"
            />
          );
        })}
      </div>
    );
  };

  render() {
    return this.getToRender();
  }
}
