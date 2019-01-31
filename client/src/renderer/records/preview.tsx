import React from 'react';
import FileViewer from 'react-file-viewer';
import { match } from "react-router";
import { MatchParams } from "./details";

const file = 'https://i.imgur.com/px9w5Q1.jpg'
const type = 'jpeg'

interface PreviewProps {
  match: match<MatchParams>;
}

export class Preview extends React.Component<PreviewProps> {
  constructor(props: PreviewProps) {
    super(props);
  }
  render() {
    return (
      <FileViewer
        fileType={type}
        filePath={file}
      />
    );
  }
}
