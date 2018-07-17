import * as React from "react";
import { UploadForm } from "./upload_form";

export interface DispatchedProps {
  submitEmails: () => void;
}

export class Upload extends React.Component {
  submitEmails = (): void => {
    console.log("foo");
  };
  render() {
    return <UploadForm submitEmails={this.submitEmails} />;
  }
}
