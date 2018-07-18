import * as React from "react";
import * as _ from "lodash";
import {
  Upload,
  Icon,
  Layout,
  Form,
  Input,
  Button,
  message,
  Select
} from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { Permission, PermissionType } from "../../models/permissions";
import { TitleProps } from "../app";
import { SelectValue } from "../../../node_modules/antd/lib/select";

const { Content } = Layout;
const Dragger = Upload.Dragger;

interface UploadState {
  permissions: Permission[];
  files: UploadFile[];
  errorMessage: string;
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
      files: [],
      errorMessage: ""
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

  handleSelect = (idx: number) => (value: SelectValue) => {
    const permissions = this.state.permissions.map((permission, pidx) => {
      if (idx !== pidx) {
        return permission;
      }
      const pType = value.toString() as keyof typeof PermissionType;
      return { ...permission, permissionType: PermissionType[pType] };
    });
    this.setState({ permissions });
  };

  handleSubmit = (event: React.FormEvent<EventTarget>): void => {
    event.preventDefault();
    console.log(this.state);
    if (this.state.files.length !== 1) {
      message.error("Please upload a file");
      return;
    }
  };

  onChange = (_info: UploadChangeParam): void => {};

  beforeUpload = (file: UploadFile): boolean => {
    if (this.state.files.length >= 1) {
      message.error("Cannot upload more than one file");
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
        <Form onSubmit={this.handleSubmit}>
          {this.state.permissions.map((permission, idx) => {
            return (
              <Input.Group key={idx} className="perimssion" compact>
                <Input
                  style={{ width: "65%" }}
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
                <Select
                  style={{ width: "35%" }}
                  onChange={this.handleSelect(idx)}
                  defaultValue={Object.keys(PermissionType)[0]}
                >
                  {Object.keys(PermissionType).map(permType => {
                    return (
                      <Select.Option key={permType} value={permType}>
                        {permType}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Input.Group>
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

          <Form.Item>
            <div>
              <Button type="primary" htmlType="submit">
                Upload
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Content>
    );
  }
}
