import * as React from "react";

interface ListViewProps<T> {
  items: T[];
  getKey: (arg: T) => string;
  renderFunc: (arg: T) => JSX.Element;
  pageTitle?: string;
  setPageTitle: (title?: string) => void;
}

export class ListView<T> extends React.Component<ListViewProps<T>, {}> {
  componentDidMount() {
    if (this.props.pageTitle !== "Home") {
      this.props.setPageTitle("Home");
    }
  }

  render() {
    if (!this.props.items.length) {
      return <p> No items found </p>;
    }
    return (
      <ul>
        {this.props.items.map(item => {
          return (
            <li key={this.props.getKey(item)}>
              {" "}
              {this.props.renderFunc(item)}{" "}
            </li>
          );
        })}
      </ul>
    );
  }
}
