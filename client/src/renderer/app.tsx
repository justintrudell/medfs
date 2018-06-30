import * as React from "react";
import { Main } from "./main";
import { Header } from "./home/header";

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
