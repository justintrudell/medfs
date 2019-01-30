import React, { Component } from 'react';
import FileViewer from 'react-file-viewer';

const file = 'http://example.com/image.png'
const type = 'png'

export class Preview extends Component {
  render() {
    return (
      <FileViewer
        fileType={type}
        filePath={file}/>
    );
  }
}