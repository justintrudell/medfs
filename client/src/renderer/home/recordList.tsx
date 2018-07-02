import * as React from "react";
import { getAllForUser } from "../../api/records";
import { RecordItem } from "../../models/records";

type RecordListState = {
  records: RecordItem[];
};

interface RecordListProps {
  userId: string;
  handleError: (error: string) => void;
}

export class RecordList extends React.Component<
  RecordListProps,
  RecordListState
> {
  constructor(props: RecordListProps) {
    super(props);
    this.state = {
      records: []
    };
  }

  getAllRecords = () => {
    getAllForUser(this.props.userId)
      .then(response => {
        this.setState({records: JSON.parse(response.body).data as RecordItem[]});
      })
      .catch((error: string) => {
        this.props.handleError(error);
      });
  };

  componentWillMount() {
    this.getAllRecords();
  }

  render() {
    const htmlList = this.state.records.map(record => {
      return (
        <li key={record.id}>
          <a href={"records/" + record.hash}> {record.name} </a>
        </li>
      );
    });
    return <ul>{htmlList}</ul>;
  }
}
