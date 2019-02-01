import * as React from "react";
import { Card } from "antd";
import { Link } from "react-router-dom";
import { ListView } from "../components/lists/listView";
import { Button, Modal, Form, Input } from "antd";
import { ColumnProps } from "antd/lib/table";

type PatientListState = {
  patients: PatientInfo[];
  addPatientsModalVisible: boolean;
};

type PatientListProps = {};

interface PatientInfo {
  id: string;
  name: string;
  dateAdded: Date;
}

export class Patients extends React.Component<
  PatientListProps,
  PatientListState
> {
  constructor(props: PatientListProps) {
    super(props);
    this.state = {
      patients: [],
      addPatientsModalVisible: false
    };
  }

  getPatients() {
    // TODO: create endpoints for this
    this.setState({
      patients: [
        {
          id: "12344",
          name: "John Doe",
          dateAdded: new Date(Date.now())
        },
        {
          id: "12345",
          name: "Mary Jane",
          dateAdded: new Date(Date.now())
        }
      ]
    });
  }

  componentDidMount() {
    this.getPatients();
  }

  tableColumns = (): Array<ColumnProps<PatientInfo>> => {
    return [
      {
        title: "Name",
        key: "name",
        render: (_, patient) => (
          <Link to={`/patient/details/${patient.id}`}> {patient.name} </Link>
        ),
        sorter: (a: PatientInfo, b: PatientInfo) => a.name.localeCompare(b.name)
      },
      {
        title: "Date Added",
        key: "date_added",
        render: (_, patient) => patient.dateAdded.toLocaleString("en-US"),
        sorter: (a: PatientInfo, b: PatientInfo) =>
          a.dateAdded.getTime() - b.dateAdded.getTime()
      }
    ];
  };

  showAddPatientsModal = (): void => {
    this.setState({
      addPatientsModalVisible: true
    });
  };

  hideAddPatientsModal = (): void => {
    this.setState({
      addPatientsModalVisible: false
    });
  };

  handleOk = (): void => {
    // TODO: backend api endpoint for creating doctor patient
    this.hideAddPatientsModal();
  };

  render() {
    return (
      <div>
        <Card
          title="My Patients"
          extra={
            <Button
              type="primary"
              icon="plus"
              onClick={this.showAddPatientsModal}
            >
              Add Patient
            </Button>
          }
        >
          <ListView
            items={this.state.patients}
            columns={this.tableColumns()}
            keyProp="id"
            setPageTitle={(title?: string) => {
              return;
            }}
          />
        </Card>

        <Modal
          title="Add Patients"
          visible={this.state.addPatientsModalVisible}
          onOk={this.handleOk}
          okText="Add"
          onCancel={this.hideAddPatientsModal}
        >
          <Form>
            <Form.Item>
              <Input type="text" placeholder="Patient ID" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}
