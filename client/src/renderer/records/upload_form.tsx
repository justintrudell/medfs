import * as React from "react";
import { DispatchedProps } from "./upload";

interface UploadFormState {
  emails: string[];
}

export class UploadForm extends React.Component<
  DispatchedProps,
  UploadFormState
> {
  constructor(props: DispatchedProps) {
    super(props);
    this.state = {
      emails: [""]
    };
  }

  handleEmailAddrChange = (event: React.FormEvent<EventTarget>): void => {};

  render() {
    return (
      <div>
        <p>Enter the email addresseses of others to share this record with</p>

        <form onSubmit={this.props.submitEmails}>
          {this.state.emails.map((email, idx) => {
            <div className="emailAddr" />;
            <input
              type="text"
              placeholder={`Email address #${idx + 1}`}
              value={email}
              onChange={this.handleEmailAddrChange}
            />;
          })}

          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}
