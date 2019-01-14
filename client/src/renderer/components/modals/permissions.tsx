import * as React from "react";
import { Modal, Form, Input, Button, Select, Icon } from "antd";
import { RecordItem } from "../../../models/records";
import { Permission, PermissionType } from "../../../models/permissions";

type PermissionsModalState = {
  currentPermissions: Permission[];
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
      currentPermissions: []
    };
  }

  componentDidUpdate(prevProps: PermissionsModalProps) {
    if (this.props !== prevProps) {
      this.setState({
        currentPermissions: this.props.permissions
      });
    }
  }

  handleOk = () => {
    this.props.hideModalCallback();
  };

  handleCancel = () => {
    this.props.hideModalCallback();
  };

  render() {
    return (
      <Modal
        title={`Change permissions: ${
          this.props.record ? this.props.record.name : ""
        }`}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          {this.state.currentPermissions.map((permission, idx) => {
            return (
              <Input.Group key={idx} className="permission" compact>
                <Input
                  style={{ width: "55%", margin: "8px 0" }}
                  type="text"
                  defaultValue={permission.userEmail}
                  disabled={true}
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
                >
                  <Icon type="minus" />
                </Button>
              </Input.Group>
            );
          })}
        </Form>
      </Modal>
    );
  }
}
