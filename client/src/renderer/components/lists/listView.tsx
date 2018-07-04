import * as React from "react";

interface ListViewProps<T> {
  items: T[];
  getKey: (arg: T) => string;
  renderFunc: (arg: T) => JSX.Element;
}

export class ListView<T> extends React.Component<ListViewProps<T>, {}> {
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
