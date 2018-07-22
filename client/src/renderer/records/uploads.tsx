import * as React from "react";
import * as _ from "lodash";
import {
  Upload,
  Icon,
  Layout,
  Form,
  Input,
  Button,
  Select,
  message
} from "antd";
import { RcFile } from "antd/lib/upload/interface";
import { Permission, PermissionType } from "../../models/permissions";
import { TitleProps } from "../app";
import { SelectValue } from "antd/lib/select";
import { Error } from "../components/notifications/error";
import { uploadFile } from "../../api/records";

const { Content } = Layout;
const Dragger = Upload.Dragger;

interface UploadState {
  permissions: Permission[];
  files: RcFile[];
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
    if (this.state.files.length !== 1) {
      this.setState({ errorMessage: "Please upload a file" });
      return;
    }

    //TODO: figure out why reduce isn't working
    const nonEmptyPerms = this.state.permissions.filter(perm => {
      return !_.isEmpty(perm.userEmail);
    });

    const permissionRequest = nonEmptyPerms.map(perm => {
      return {
        email: perm.userEmail,
        value: perm.permissionType
      };
    });

    const file = this.state.files[0];
    const fileName = file.name;
    const extension = fileName.substring(fileName.lastIndexOf(".") + 1);

    uploadFile(permissionRequest, extension, this.state.files[0])
      .then(result => {
        if (result.statusCode === 200) {
          message.info("Successfully uploaded file");
        } else {
          this.setState({
            errorMessage: `Something went wrong: ${result.body.toString()}`
          });
        }
      })
      .catch(errorMessage => {
        this.setState({ errorMessage });
      });
  };

  beforeUpload = (file: RcFile): boolean => {
    if (this.state.files.length >= 1) {
      this.setState({ errorMessage: "Cannot upload more than one file" });
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

  addUser = () => {
    this.setState({
      permissions: this.state.permissions.concat([
        { userEmail: "", permissionType: PermissionType.READ }
      ])
    });
  };

  removeUser = (idx: number) => () => {
    this.setState({
      permissions: this.state.permissions.filter((_perm, pIdx) => pIdx !== idx)
    });
  };

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
                  style={{ width: "55%", margin: "8px 0" }}
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
                  style={{ width: "35%", margin: "8px 0" }}
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

                <Button
                  type="primary"
                  onClick={this.removeUser(idx)}
                  style={{ width: "10%", margin: "8px 0" }}
                >
                  <Icon type="minus" />
                </Button>
              </Input.Group>
            );
          })}

          <Form.Item>
            <div>
              <Button type="primary" onClick={this.addUser}>
                <Icon type="plus" />
              </Button>
            </div>
          </Form.Item>

          <Dragger
            name="upload"
            multiple={false}
            beforeUpload={this.beforeUpload}
            fileList={this.state.files}
            style={{ padding: 8, margin: 8 }}
            disabled={this.state.files.length > 0}
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
                <Icon type="upload" /> Upload
              </Button>
            </div>
          </Form.Item>
        </Form>
        <Error errorMessage={this.state.errorMessage} />
      </Content>
    );
  }
}
