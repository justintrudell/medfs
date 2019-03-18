import * as React from "react";
import { Link } from "react-router-dom";
import { ListView } from "../components/lists/listView";
import { Card, Button, Modal, Form, Input, message, Icon } from "antd";
import { ColumnProps } from "antd/lib/table";
import { DoctorPatientInfo } from "../../models/patients";
import { addPatient, getPatients } from "../../api/patients";
import * as _ from "lodash";

type PatientListState = {
  patients: DoctorPatientInfo[];
  addPatientsModalVisible: boolean;
  newPatient: string;
  loading: boolean;
};

type PatientListProps = {};

export class Patients extends React.Component<
  PatientListProps,
  PatientListState
> {
  constructor(props: PatientListProps) {
    super(props);
    this.state = this.getDefaultState();
  }

  getDefaultState = () => {
    return {
      patients: [],
      addPatientsModalVisible: false,
      newPatient: "",
      loading: true
    };
  };

  getPatients() {
    getPatients()
      .then(patients => {
        this.setState({
          patients,
          loading: false
        });
      })
      .catch(errorMessage => {
        console.error(errorMessage);
        message.error("Could not get patients");
        this.setState({ loading: false });
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
        sorter: (a: DoctorPatientInfo, b: DoctorPatientInfo) =>
          a.email.localeCompare(b.email)
      },
      {
        title: "Last Updated",
        key: "last_updated",
        render: (_, patient) =>
          patient.lastUpdate ? patient.lastUpdate.toLocaleString("en-US") : "-",
        sorter: (a: DoctorPatientInfo, b: DoctorPatientInfo) => {
          const aTime = a.lastUpdate ? a.lastUpdate.getTime() : 0;
          const bTime = b.lastUpdate ? b.lastUpdate.getTime() : 0;

          return aTime - bTime;
        },
        defaultSortOrder: "descend"
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
  };

  handleOk = (): void => {
    if (
      this.state.newPatient !== undefined &&
      !_.isEmpty(this.state.newPatient)
    ) {
      addPatient(this.state.newPatient)
        .then(m => {
          this.resetView();
          this.getPatients();
          message.success(m);
        })
        .catch(errorMessage => {
          console.error(errorMessage);
          this.resetView();
          message.error("Something went wrong");
        });
    } else {
      this.resetView();
    }
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      newPatient: e.target.value
    });
  };

  handleRefresh = () => {
    this.setState(this.getDefaultState());
    this.getPatients();
  };

  render() {
    return (
      <div>
        <Card
          loading={this.state.loading}
          title={
            <div>
              My Patients
              <Icon
                style={{ padding: 10 }}
                type="sync"
                onClick={this.handleRefresh}
                spin={this.state.loading}
              />
            </div>
          }
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
