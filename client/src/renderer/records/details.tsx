import * as React from "react";
import { match } from "react-router";
import { get } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";
import { getIpfs } from "../../ipfs/ipfsProvider";
import { writeFile } from "fs";
import { constants } from "../../config";
import { join } from "path";
import { IPFSFile } from "ipfs";
import { DispatchedProps } from "../app";
import { Button, Table, Alert } from "antd";

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

    getIpfs().then(ipfs => {
      ipfs.files
        .get(this.state.recordDetails!.hash)
        .then(result => {
          result.forEach(file => {
            this.downloadFile(file);
          });
        })
        .catch(err => {
          this.setState({ downloadMessages: [err.message] });
        });
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
          onClick={this.downloadRecord}
        >
          Download
        </Button>
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
