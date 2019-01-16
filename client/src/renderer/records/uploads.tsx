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
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import {
  Permission,
  PermissionType,
  PermissionRequest
} from "../../models/permissions";
import { TitleProps } from "../app";
import { SelectValue } from "antd/lib/select";
import { Error } from "../components/notifications/error";
import { encryptFileAndUpload } from "../../api/records";
import { getKeys } from "../../api/users";
import { getLogin } from "../../utils/loginUtils";
import * as crypto from "crypto";

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
      errorMessage: ""
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
        getKeys(emails)
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

    const permissionRequest = this.buildPermissionRequest(
      keys,
      aesKey,
      iv,
      perms
    );

    const file = this.state.files[0];
    const extension = file.name.substring(file.name.lastIndexOf(".") + 1);
    encryptFileAndUpload(
      permissionRequest,
      aesKey.toString("hex"),
      iv,
      extension,
      file
    )
      .then(result => {
        if (result.statusCode === 200) {
          message.info("Successfully uploaded file");
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

  buildPermissionRequest(
    pubKeys: Map<string, string>,
    aesKey: Buffer,
    iv: string,
    perms: Permission[]
  ): PermissionRequest[] {
    return perms.map(perm => {
      const pubKey = pubKeys.get(perm.userEmail);
      if (pubKey === undefined) {
        // This should never happen
        this.setState({
          errorMessage: `No key exists for email ${perm.userEmail}`
        });
        throw Error;
      }
      const encryptedKey = crypto.publicEncrypt(pubKey, aesKey).toString("hex");
      return {
        email: perm.userEmail,
        values: {
          permission: perm.permissionType,
          encryptedAesKey: encryptedKey,
          iv: iv
        }
      };
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

  removeFile = (_file: UploadFile) => {
    this.setState({ files: [] });
  };

  render() {
    return (
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          height: "85vh"
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
            onRemove={this.removeFile}
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
