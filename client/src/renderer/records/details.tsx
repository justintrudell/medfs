import * as React from "react";
import { match } from "react-router";
import { get } from "../../api/records";
import { RecordDetails } from "../../models/records";
import * as _ from "lodash";
import { downloadRecord } from "../../utils/recordUtils";
import { join, dirname } from "path";
import { setPageTitle } from "../app";
import { Button, Table, Alert, Card, Spin, Empty } from "antd";
import { shell, remote } from "electron";
import util from "util";
const copyFile = util.promisify(require("fs").copyFile);

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
  loading: boolean;
  downloading: boolean;
  error: boolean;
}

export class DetailView extends React.Component<DetailProps, DetailState> {
  constructor(props: DetailProps) {
    super(props);

    this.state = {
      downloadMessages: [],
      loading: true,
      downloading: false,
      error: false
    };
  }

  componentDidMount() {
    get(this.props.match.params.record_id)
      .then(recordDetails => {
        if (this.props.pageTitle !== recordDetails.filename) {
          this.props.setPageTitle(recordDetails.filename);
        }
        this.setState({ recordDetails, loading: false });
      })
      .catch(error => {
        console.error(error);
        this.setState({ loading: false, error: true });
      });
  }

  openTmpFile = () => {
    this.saveCopyOfTmpFile(false)
      .then(filePath => {
        if (filePath) {
          shell.openItem(filePath);
        }
      })
      .catch(err => {
        this.setState({ downloadMessages: [err.message] });
      });
  };

  saveRecordToDownloads = () => {
    this.saveCopyOfTmpFile(true)
      .then(filePath => {
        if (filePath) {
          this.setState(prevState => ({
            downloadMessages: [
              ...prevState.downloadMessages,
              `Downloaded to ${filePath}`
            ]
          }));
        }
      })
      .catch(err => {
        this.setState({ downloadMessages: [err.message] });
      });
  };

  saveCopyOfTmpFile = (isDownload: boolean) => {
    if (!this.state.recordDetails || _.isEmpty(this.state.recordDetails)) {
      return Promise.reject(new Error("No record details"));
    }

    let chosenDownloadPath;
    if (isDownload) {
      chosenDownloadPath = remote.dialog.showSaveDialog(
        remote.getCurrentWindow(),
        {
          defaultPath: this.state.recordDetails!.filename
        }
      );
      // Undefined if user cancelled the dialog
      if (chosenDownloadPath === undefined) {
        return Promise.resolve("");
      }
    }
    this.setState({ downloading: true });

    return (async () => {
      try {
        const tmpFile = await downloadRecord(
          this.state.recordDetails!.hash,
          this.state.recordDetails!.id
        );
        const pathToSaveTo = isDownload
          ? chosenDownloadPath
          : join(dirname(tmpFile.path), this.state.recordDetails!.filename);

        await copyFile(tmpFile.path, pathToSaveTo);
        tmpFile.cleanup();
        this.setState({ downloading: false });
        return pathToSaveTo;
      } catch (err) {
        this.setState({ downloading: false });
        return Promise.reject(err);
      }
    })();
  };

  getToRender = (): JSX.Element => {
    if (this.state.error) {
      return (
        <Card>
          <Empty description={"This record wasn't found!"} />
        </Card>
      );
    }

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
      <Card
        title={this.state.recordDetails.filename}
        loading={this.state.loading}
      >
        <Table columns={columns} dataSource={pKeys} pagination={false} />
        {this.state.downloading && (
          <div style={{ paddingTop: 24 }}>
            <Spin />
          </div>
        )}
        {!this.state.downloading && (
          <React.Fragment>
            <Button
              style={{ marginTop: 24 }}
              type="primary"
              icon="download"
              onClick={this.saveRecordToDownloads}
            >
              Download
            </Button>
            <Button
              style={{ marginTop: 24, marginLeft: 12 }}
              type="primary"
              icon="select"
              onClick={this.openTmpFile}
            >
              Preview
            </Button>
          </React.Fragment>
        )}
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
        )}
      </Card>
    );
  };

  render() {
    return this.getToRender();
  }
}
