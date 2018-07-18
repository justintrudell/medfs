import * as React from "react";
import { Layout } from "antd";
import * as _ from "lodash";
import { Upload, Icon } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { Permission, PermissionType } from "../../models/permissions";
import { TitleProps } from "../app";

const { Content } = Layout;
const Dragger = Upload.Dragger;

interface UploadState {
  permissions: Permission[];
  files: UploadFile[];
}

export class Uploads extends React.Component<TitleProps, UploadState> {
  constructor(props: TitleProps) {
    super(props);
    this.state = {
      permissions: _.range(3).map(_v => {
        return {
          userEmail: "",
          permissionType: PermissionType.READ
        };
      }),
      files: []
    };
  }

  handleChange = <T extends {}>(
    idx: number,
    key: keyof Permission,
    extractPermission: (elem: HTMLInputElement) => T
  ) => (event: React.FormEvent<EventTarget>): void => {
    const permissions = this.state.permissions.map((permission, pidx) => {
      if (idx !== pidx) {
        return permission;
      }

      const target = event.target as HTMLInputElement;
      return { ...permission, [key]: extractPermission(target) };
    });
    this.setState({ permissions });
  };

  handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    console.log(this.state);
  };

  onChange = (info: UploadChangeParam): void => {
    console.log("File uploaded", info);
  };

  beforeUpload = (file: UploadFile): boolean => {
    if (this.state.files.length >= 1) {
      // TODO, reflect in UI
      console.log("Can only upload one file");
      return false;
    }
    this.setState(({ files }) => ({
      files: [...files, file]
    }));
    return false;
  };

  componentDidMount() {
    this.props.setPageTitle("Upload");
  }

  render() {
    return (
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          minHeight: 280
        }}
      >
        <form onSubmit={this.handleSubmit}>
          {this.state.permissions.map((permission, idx) => {
            return (
              <div key={idx} className="perimssion">
                <input
                  type="text"
                  placeholder="Email address"
                  value={permission.userEmail}
                  onChange={this.handleChange(
                    idx,
                    "userEmail",
                    (elem: HTMLInputElement): string => {
                      return elem.value;
                    }
                  )}
                />
                <select
                  onChange={this.handleChange(
                    idx,
                    "permissionType",
                    (elem: HTMLInputElement): string => {
                      return PermissionType[
                        elem.value as keyof typeof PermissionType
                      ];
                    }
                  )}
                >
                  {Object.keys(PermissionType).map(permType => {
                    return (
                      <option key={permType} value={permType}>
                        {permType}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}

          <Dragger
            name="upload"
            multiple={false}
            onChange={this.onChange}
            beforeUpload={this.beforeUpload}
            fileList={this.state.files}
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>

          <input type="submit" value="Submit" />
        </form>
      </Content>
    );
  }
}
