import * as React from "react";
import { match } from "react-router";
import * as _ from "lodash";
import { Card, Upload, Icon, Form, Input, Button, Select, message } from "antd";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import { Permission, PermissionType } from "../../models/permissions";
import { TitleProps } from "../app";
import { SelectValue } from "antd/lib/select";
import { Error } from "../components/notifications/error";
import { encryptFileAndUpload } from "../../api/records";
import { getKeys } from "../../api/users";
import { getUsersForRecord } from "../../api/permissions";
import { getLogin } from "../../utils/loginUtils";
import { buildPermissionRequest } from "../../utils/recordUtils";
import * as crypto from "crypto";

interface MatchParams {
  autofill_email?: string;
  record_id?: string;
}

type UploadProps = {
  match?: match<MatchParams>;
};

interface UploadState {
  permissions: Permission[];
  files: RcFile[];
  errorMessage: string;
  isUpdate: boolean;
}

export class Uploads extends React.Component<
  UploadProps & TitleProps,
  UploadState
> {
  constructor(props: TitleProps) {
    super(props);
    this.state = this.getDefaultState();
  }

  getDefaultState = (): UploadState => {
    return {
      permissions: _.range(3).map(_v => {
        return {
          userEmail: "",
          permissionType: PermissionType.READ
        };
      }),
      files: [],
      errorMessage: "",
      isUpdate: false
    };
  };

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

    getLogin().then(userInternal => {
      if (!_.isEmpty(userInternal)) {
        // Add ourselves so we can receive the key to decode
        nonEmptyPerms.push({
          userEmail: userInternal!.email,
          permissionType: PermissionType.WRITE
        });

        const emails = nonEmptyPerms.map(p => p.userEmail);
        getKeys(emails, true)
          .then(pubKeys => {
            this.handleFileUpload(pubKeys, nonEmptyPerms);
          })
          .catch((e: Error) => this.setState({ errorMessage: e.toString() }));
      }
    });
  };

  handleFileUpload(keys: Map<string, string>, perms: Permission[]) {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16).toString("hex");
    const permissionRequest = buildPermissionRequest(keys, aesKey, iv, perms);

    const file = this.state.files[0];
    encryptFileAndUpload(
      permissionRequest,
      aesKey.toString("hex"),
      iv,
      file,
      this.state.isUpdate ? this.props.match!.params.record_id : undefined
    )
      .then(result => {
        if (result.statusCode === 200) {
          const successMessage = this.state.isUpdate ? "Successfully updated file" : "Successfully uploaded file";
          message.info(successMessage);
          this.setState(this.getDefaultState());
        } else {
          this.setState({
            errorMessage: `Something went wrong: ${result.body.toString()}`
          });
        }
      })
      .catch(errorMessage => {
        this.setState({ errorMessage });
      });
  }

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
    if (this.props.match !== undefined) {
      // Email autofill
      if(!_.isEmpty(this.props.match.params.autofill_email)) {
        const permissions = this.state.permissions;
        permissions[0] = {
          userEmail: this.props.match.params.autofill_email!,
          permissionType: PermissionType.READ
        };
        this.setState({ permissions });
      }

      // Record update
      if(!_.isEmpty(this.props.match.params.record_id)) {
        const recordId = this.props.match.params.record_id!;
        getUsersForRecord(recordId).then((permissions: Permission[]) => {
          this.setState({ permissions, isUpdate: true });
        });
      }
    }
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

  removeFile = (_file: UploadFile) => {
    this.setState({ files: [] });
  };

  render() {
    const formItemLayout = {
      labelCol: {
        sm: { span: 4 }
      },
      wrapperCol: {
        sm: { span: 16 }
      }
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        sm: { span: 16, offset: 4 }
      }
    };
    return (
      <div>
        <Card title="Upload Document">
          <Form onSubmit={this.handleSubmit}>
            <Form.Item {...formItemLayout} label="Select a Document">
              <Upload
                multiple={false}
                beforeUpload={this.beforeUpload}
                fileList={this.state.files}
                disabled={this.state.files.length > 0}
                onRemove={this.removeFile}
              >
                <Button>Select File</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label="Share document"
              style={{ marginBottom: 0 }}
            >
              {this.state.permissions.map((permission, idx) => {
                return (
                  <Input.Group key={idx} className="permission">
                    <Input
                      type="text"
                      placeholder="Email address"
                      value={permission.userEmail}
                      style={{ width: "43%", marginRight: "2%" }}
                      onChange={this.handleChange(
                        idx,
                        "userEmail",
                        (elem: HTMLInputElement): string => {
                          return elem.value;
                        }
                      )}
                    />

                    <Select
                      style={{ width: "33%", marginRight: "2%" }}
                      onChange={this.handleSelect(idx)}
                      placeholder = "Select Permission"
                      // Only show a permission value if we're updating a file and prepopulating permissions
                      // Otherwise, default value should be undefined so the placeholder text appears
                      value = {this.state.isUpdate ? this.state.permissions[idx].permissionType : undefined}
                    >
                      {Object.keys(PermissionType).map(permType => {
                        return (
                          <Select.Option
                            key={permType}
                            value={permType}
                          >
                            {
                              PermissionType[
                                permType as keyof typeof PermissionType
                              ]
                            }
                          </Select.Option>
                        );
                      })}
                    </Select>

                    <Button type="primary" onClick={this.removeUser(idx)}>
                      <Icon type="minus" />
                    </Button>
                  </Input.Group>
                );
              })}
            </Form.Item>

            <Form.Item {...formItemLayoutWithOutLabel}>
              <Button
                type="dashed"
                onClick={this.addUser}
                style={{ width: "78%", borderWidth: "1.5px" }}
              >
                <Icon type="plus" /> Add User
              </Button>
            </Form.Item>

            <Form.Item {...formItemLayoutWithOutLabel}>
              <Button type="primary" htmlType="submit">
                <Icon type="upload" /> Upload
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Error errorMessage={this.state.errorMessage} />
      </div>
    );
  }
}
