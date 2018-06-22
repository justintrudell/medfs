import * as React from "react";
import Main from "./main";
import Header from "./header";

export default class extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Main />
      </div>
    );
  }
};
