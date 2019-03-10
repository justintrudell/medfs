import * as React from "react";
import { ListView } from "../components/lists/listView";
import { Card, message, Icon } from "antd";
import { ColumnProps } from "antd/lib/table";
import { DoctorPatientInfo } from "../../models/patients";
import { getDoctors } from "../../api/doctors";
import * as _ from "lodash";

type State = {
  doctors: DoctorPatientInfo[];
  loading: boolean;
};

type Props = {};

export class DoctorsPage extends React.Component<Props, State> {
  constructor(props: State) {
    super(props);
    this.state = this.getDefaultState();
  }

  getDefaultState = () => {
    return {
      doctors: [],
      loading: true
    };
  };

  loadDoctors() {
    getDoctors()
      .then(doctors => {
        this.setState({
          doctors,
          loading: false
        });
      })
      .catch(errorMessage => {
        console.error(errorMessage);
        message.error("Could not get doctors");
        this.setState({ loading: false });
      });
  }

  componentDidMount() {
    this.loadDoctors();
  }

  tableColumns = (): Array<ColumnProps<DoctorPatientInfo>> => {
    return [
      {
        title: "Email",
        key: "email",
        render: (_, doctor) => doctor.email,
        sorter: (a: DoctorPatientInfo, b: DoctorPatientInfo) =>
          a.email.localeCompare(b.email)
      },
      {
        title: "Date Added",
        key: "date_added",
        render: (_, doctor) => doctor.dateAdded.toLocaleString("en-US"),
        sorter: (a: DoctorPatientInfo, b: DoctorPatientInfo) =>
          a.dateAdded.getTime() - b.dateAdded.getTime()
      }
    ];
  };

  handleRefresh = () => {
    this.setState(this.getDefaultState());
    this.loadDoctors();
  };

  render() {
    return (
      <div>
        <Card
          loading={this.state.loading}
          title={
            <div>
              My Doctors
              <Icon
                style={{ padding: 10 }}
                type="sync"
                onClick={this.handleRefresh}
                spin={this.state.loading}
              />
            </div>
          }
        >
          <ListView
            items={this.state.doctors}
            columns={this.tableColumns()}
            keyProp="id"
            setPageTitle={(_title?: string) => {
              return;
            }}
          />
        </Card>
      </div>
    );
  }
}
