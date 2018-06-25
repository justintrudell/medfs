import * as React from "react";
import { Main } from "./main";
import { Header } from "./header";

export class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Main />
      </div>
    );
  }
}
