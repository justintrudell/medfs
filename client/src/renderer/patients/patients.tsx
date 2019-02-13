import * as React from "react";
import { Link } from "react-router-dom";
import { ListView } from "../components/lists/listView";
import { Card, Button, Modal, Form, Input, message, } from "antd";
import { ColumnProps } from "antd/lib/table";
import { DoctorPatientInfo } from "../../models/patients";
import { addPatient, getPatients } from "../../api/patients";
import * as _ from "lodash";

type PatientListState = {
  patients: DoctorPatientInfo[];
  addPatientsModalVisible: boolean;
  newPatient: string;
};

type PatientListProps = {};

export class Patients extends React.Component<
  PatientListProps,
  PatientListState
  > {
  constructor(props: PatientListProps) {
    super(props);
    this.state = {
      patients: [],
      addPatientsModalVisible: false,
      newPatient: ""
    };
  }

  getPatients() {
    getPatients().then(patients => {
      this.setState({
        patients
      });
    }).catch(errorMessage => {
      console.error(errorMessage);
      message.error("Could not get patients");
    });
  }

  componentDidMount() {
    this.getPatients();
  }

  tableColumns = (): Array<ColumnProps<DoctorPatientInfo>> => {
    return [
      {
        title: "Email",
        key: "email",
        render: (_, patient) => (
          <Link to={`/patients/${patient.id}`}> {patient.email} </Link>
        ),
        sorter: (a: DoctorPatientInfo, b: DoctorPatientInfo) => a.email.localeCompare(b.email)
      },
      {
        title: "Date Added",
        key: "date_added",
        render: (_, patient) => patient.dateAdded.toLocaleString("en-US"),
        sorter: (a: DoctorPatientInfo, b: DoctorPatientInfo) =>
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

  resetView = (): void => {
    this.setState({
      newPatient: ""
    });
    this.hideAddPatientsModal();
  }

  handleOk = (): void => {
    if (this.state.newPatient !== undefined && !_.isEmpty(this.state.newPatient)) {
      addPatient(this.state.newPatient).then(m => {
        this.resetView();
        this.getPatients();
        message.success(m);
      }).catch(errorMessage => {
        console.error(errorMessage);
        this.resetView();
        message.error("Something went wrong");
      });
    }
    else {
      this.resetView();
    }
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      newPatient: e.target.value
    });
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
              <Input
                type="text"
                placeholder="Patient ID"
                value={this.state.newPatient}
                onChange={this.handleChange}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}
