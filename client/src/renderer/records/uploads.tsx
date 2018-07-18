import * as React from "react";
import { Permission, PermissionType } from "../../models/permissions";

interface UploadState {
  permissions: Permission[];
}

export class Uploads extends React.Component<{}, UploadState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      permissions: []
    };
  }

  handleEmailChange = (idx: number) => (
    event: React.FormEvent<EventTarget>
  ): void => {
    const permissions = this.state.permissions.map((permission, pidx) => {
      if (idx != pidx) {
        return permission;
      }
      const target = event.target as HTMLInputElement;
      return { ...permission, name: target.value };
    });
    this.setState({ permissions });
  };

  //TODO: change to one function
  handleDropdownChange = (idx: number) => (
    event: React.FormEvent<EventTarget>
  ): void => {
    const permissions = this.state.permissions.map((permission, pidx) => {
      if (idx != pidx) {
        return permission;
      }
      const target = event.target as HTMLInputElement;
      const permissionType =
        PermissionType[target.value as keyof typeof PermissionType];
      return { ...permission, permissionType: permissionType };
    });
    this.setState({ permissions });
  };

  handleSubmit(event: React.FormEvent<EventTarget>) {
    event.preventDefault();
    console.log("HERE");
    console.log(this.state);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2> Upload </h2>
        {this.state.permissions.map((permission, idx) => {
          <div className="perimssion">
            <input
              type="text"
              placeholder={`Email address #${idx}`}
              value={permission.userEmail}
              onChange={this.handleEmailChange(idx)}
            />
            <select onChange={this.handleDropdownChange(idx)}>
              {Object.keys(PermissionType).map(permType => {
                <option value={permType}> {permType} </option>;
              })}
            </select>
          </div>;
        })}

        <input type="submit" value="Submit" />
      </form>
    );
  }
}
