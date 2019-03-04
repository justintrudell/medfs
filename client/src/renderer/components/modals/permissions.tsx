import * as React from "react";
import { Modal, Form, Input, Button, Select, Icon } from "antd";
import { RecordItem } from "../../../models/records";
import { Permission, PermissionType } from "../../../models/permissions";
import { updatePermissions } from "../../../api/permissions";
import { getKeyForRecord } from "../../../api/records";
import { buildPermissionRequest } from "../../../utils/recordUtils";
import { Error } from "../../components/notifications/error";
import * as _ from "lodash";
import { getKeys } from "../../../api/users";

type PermissionsModalState = {
  currentPermissions: Permission[];
  okButtonDisabled: boolean;
  errorMessage?: string;
};

export interface PermissionsModalProps {
  visible: boolean;
  record?: RecordItem;
  permissions: Permission[];
  hideModalCallback: () => void;
}

export class PermissionsModal extends React.Component<
  PermissionsModalProps,
  PermissionsModalState
> {
  constructor(props: PermissionsModalProps) {
    super(props);

    this.state = {
      currentPermissions: [],
      okButtonDisabled: true
    };
  }

  componentDidUpdate(prevProps: PermissionsModalProps) {
    if (this.props !== prevProps) {
      this.setState({
        currentPermissions: this.props.permissions,
        okButtonDisabled: true
      });
    }
  }

  handleOk = () => {
    (async () => {
      const nonEmptyPerms = this.state.currentPermissions.filter(p => {
        return !_.isEmpty(p.userEmail);
      });
      try {
        const emails = nonEmptyPerms.map(p => p.userEmail);
        const pubKeys = await getKeys(emails);
        const recordKey = await getKeyForRecord(this.props.record!.id);
        const permissionRequest = buildPermissionRequest(
          pubKeys,
          Buffer.from(recordKey.aesKey),
          recordKey.iv,
          nonEmptyPerms
        );
        updatePermissions(permissionRequest, this.props.record!.id);
        this.props.hideModalCallback();
      } catch (e) {
        this.setState({ errorMessage: e.toString() });
      }
    })();
  };

  handleCancel = () => {
    this.setState({ errorMessage: undefined });
    this.props.hideModalCallback();
  };

  handleRemove = (idx: number) => {
    const permissions = this.state.currentPermissions.filter(
      (_, pIdx) => pIdx !== idx
    );
    this.setState({
      currentPermissions: permissions,
      okButtonDisabled: _.isEqual(permissions, this.props.permissions)
    });
  };

  addUser = () => {
    this.setState({
      currentPermissions: this.state.currentPermissions.concat([
        { userEmail: "", permissionType: PermissionType.READ }
      ])
    });
  };

  handleEmailChange = (idx: number) => (
    event: React.FormEvent<EventTarget>
  ): void => {
    const permissions = this.state.currentPermissions.map(
      (permission, pidx) => {
        if (idx !== pidx) {
          return permission;
        }

        const target = event.target as HTMLInputElement;
        return { ...permission, ["userEmail"]: target.value };
      }
    );
    this.setState({
      currentPermissions: permissions,
      okButtonDisabled: _.isEqual(permissions, this.props.permissions),
      errorMessage: undefined
    });
  };

  handleSelectChange = (idx: number) => (value: PermissionType): void => {
    const permissions = this.state.currentPermissions.map(
      (permission, pidx) => {
        if (idx !== pidx) {
          return permission;
        }

        return {
          ...permission,
          ["permissionType"]: value
        };
      }
    );
    this.setState({
      currentPermissions: permissions,
      okButtonDisabled: _.isEqual(permissions, this.props.permissions),
      errorMessage: undefined
    });
  };

  render() {
    return (
      <Modal
        title={`Change permissions: ${
          this.props.record ? this.props.record.name : ""
        }`}
        visible={this.props.visible}
        onOk={this.handleOk}
        okText="Save"
        okButtonProps={{ disabled: this.state.okButtonDisabled }}
        onCancel={this.handleCancel}
      >
        <Form>
          {this.state.currentPermissions.map((permission, idx) => {
            return (
              <Input.Group key={idx} className="permission" compact>
                <Input
                  style={{ width: "55%", margin: "8px 0" }}
                  type="text"
                  placeholder="Email address"
                  value={permission.userEmail}
                  onChange={this.handleEmailChange(idx)}
                />
                <Select
                  style={{ width: "35%", margin: "8px 0" }}
                  defaultValue={permission.permissionType}
                  onChange={this.handleSelectChange(idx)}
                >
                  {Object.keys(PermissionType)
                    .filter(v => {
                      return (
                        PermissionType[v as any] !== PermissionType.DISABLED
                      );
                    })
                    .map(permType => {
                      return (
                        <Select.Option key={permType} value={permType}>
                          {permType}
                        </Select.Option>
                      );
                    })}
                </Select>

                <Button
                  type="primary"
                  style={{ width: "10%", margin: "8px 0" }}
                  onClick={() => this.handleRemove(idx)}
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
          <Error errorMessage={this.state.errorMessage} />
        </Form>
      </Modal>
    );
  }
}
