import * as React from "react";
import { match } from "react-router";
import { get, getKeyForRecord } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";
import { getIpfs } from "../../ipfs/ipfsProvider";
import { writeFile } from "fs";
import { constants } from "../../config";
import { join } from "path";
import { IPFSFile } from "ipfs";
import { setPageTitle } from "../app";
import { Button, Table, Alert } from "antd";
import { file } from "tmp-promise";
import util from "util";
const exec = util.promisify(require("child_process").exec);

interface MatchParams {
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

  decryptFile = (encryptedContent: string): Promise<string> => {
    return (async () => {
      const keyAndIv = await getKeyForRecord(this.state.recordDetails!.id);
      const { path: encPath, cleanup: encCleanup } = await file({
        mode: 0o644,
        prefix: "medfstmp-"
      });
      await util.promisify(writeFile)(encPath, encryptedContent);
      const decryptedContents = await exec(
        `src/scripts/decrypt_file.sh "${encPath}" "${keyAndIv.aesKey}" "${
          keyAndIv.iv
        }"`
      );
      encCleanup();
      return decryptedContents.stdout;
    })();
  };

  downloadFile = (file: IPFSFile): void => {
    if (file.content) {
      const filePath = join(
        constants.DOWNLOAD_PATH,
        this.state.recordDetails!.filename
      );
      this.decryptFile(file.content as string).then(decryptedContents => {
        writeFile(filePath, decryptedContents, err => {
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
