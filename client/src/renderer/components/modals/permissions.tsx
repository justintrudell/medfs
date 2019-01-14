import * as React from "react";
import { Modal, Form, Input, Button, Select, Icon } from "antd";
import { RecordItem } from "../../../models/records";
import { Permission, PermissionType } from "../../../models/permissions";
import * as _ from "lodash";

type PermissionsModalState = {
  currentPermissions: Permission[];
  okButtonDisabled: boolean;
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
        okButtonDisabled: true,
      });
    }
  }

  handleOk = () => {
    // TODO: Handle Save here - blocked by not saving keys
    this.props.hideModalCallback();
  };

  handleCancel = () => {
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

  handleChange = <T extends {}>(
    idx: number,
    key: keyof Permission,
    extractPermission: (elem: HTMLInputElement) => T
  ) => (event: React.FormEvent<EventTarget>): void => {
    const permissions = this.state.currentPermissions.map(
      (permission, pidx) => {
        if (idx !== pidx) {
          return permission;
        }

        const target = event.target as HTMLInputElement;
        return { ...permission, [key]: extractPermission(target) };
      }
    );
    this.setState({
      currentPermissions: permissions,
      okButtonDisabled: _.isEqual(permissions, this.props.permissions)
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
                  defaultValue={permission.permissionType}
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
        </Form>
      </Modal>
    );
  }
}
