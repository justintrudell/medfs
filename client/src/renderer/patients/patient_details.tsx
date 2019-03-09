import * as React from "react";
import { match } from "react-router";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Statistic, Divider } from "antd";
import { getPatientInfo, getAllForPatient } from "../../api/patients";
import { PatientInfo } from "../../models/patients";
import { RecordItem } from "../../models/records";
import { ColumnProps } from "antd/lib/table";
import { ListView } from "../components/lists/listView";
import { getUsersForRecord } from "../../api/permissions";
import { Permission } from "../../models/permissions";
import { RecordListState } from "../records/records";
import { PermissionsModal } from "../components/modals/permissions";

interface MatchParams {
  patient_id: string;
}

type PatientDetailsState = {
  info: PatientInfo | undefined;
};

type PatientDetailsProps = {
  match: match<MatchParams>;
};

export class PatientDetails extends React.Component<
  PatientDetailsProps,
  PatientDetailsState & RecordListState
> {
  constructor(props: PatientDetailsProps) {
    super(props);

    this.state = {
      info: undefined,
      records: [],
      canEditRecord: {},
      permissionsModalVisible: false,
      currentPermissions: [],
      loading: false
    };
  }

  componentDidMount() {
    const patientId = this.props.match.params.patient_id;

    Promise.all([getPatientInfo(patientId), getAllForPatient(patientId)])
      .then(results => {
        this.setState({
          info: results[0] as PatientInfo,
          records: results[1] as RecordItem[]
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  getPageTitle = (): string => {
    const info = this.state.info;
    if (info !== undefined) {
      if (info.firstName !== null && info.lastName !== null) {
        return info.firstName + " " + info.lastName;
      }
    }
    return "Patient Info";
  };

  getDOB = () => {
    const info = this.state.info;
    if (info !== undefined && info.dateOfBirth !== null) {
      return (
        info.dateOfBirth.getFullYear() +
        "-" +
        (info.dateOfBirth.getMonth() + 1) +
        "-" +
        info.dateOfBirth.getDate()
      );
    }
    return;
  };

  tableColumns = (): Array<ColumnProps<RecordItem>> => {
    return [
      {
        title: "File",
        dataIndex: "name",
        key: "name",
        render: (_, record) => (
          <Link to={`/records/details/${record.id}`}> {record.name} </Link>
        ),
        sorter: (a: RecordItem, b: RecordItem) => a.name.localeCompare(b.name)
      },
      {
        title: "Shared With",
        dataIndex: "shared_with",
        key: "shared_with",
        render: (_, record) => {
          return record.permissionedUsers.map(u => u.email).join(", ");
        }
      },
      {
        title: "Created At",
        key: "created_at",
        render: (_, record) => record.created.toLocaleString("en-US"),
        sorter: (a: RecordItem, b: RecordItem) =>
          a.created.getTime() - b.created.getTime()
      },
      {
        title: "Actions",
        key: "action",
        render: (_, record) => (
          <span>
            {/* TODO: add download link back once its functional */}
            {/* <a href="javascript:;">Download</a>
            <Divider type="vertical" /> */}
            <a
              href="javascript:;"
              onClick={() => this.showPermissionsModal(record)}
            >
              Edit Permissions
            </a>
          </span>
        )
      }
    ];
  };

  showPermissionsModal = (record: RecordItem) => {
    getUsersForRecord(record.id)
      .then((permissions: Permission[]) => {
        this.setState({
          permissionsModalVisible: true,
          currentRecord: record,
          currentPermissions: permissions
        });
      })
      .catch((error: Error) => {
        console.log(error);
      });
  };

  hidePermissionsModal = (): void => {
    this.setState({
      permissionsModalVisible: false,
      currentPermissions: []
    });
  };

  render() {
    return (
      <div>
        <Card
          title={this.getPageTitle()}
          extra={
            <Link to={`/uploads/${this.state.info && this.state.info.email}`}>
              <Button type="primary" icon="plus">
                Add Document
              </Button>
            </Link>
          }
        >
          <Row gutter={32}>
            <Col span={6}>
              <Statistic
                title="Email"
                value={this.state.info && this.state.info.email}
              />
            </Col>
            <Col span={6}>
              <Statistic title="Date of Birth" value={this.getDOB()} />
            </Col>
            <Col span={6}>
              <Statistic
                title="Blood Type"
                value={this.state.info && this.state.info.bloodType}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Sex"
                value={this.state.info && this.state.info.sex}
              />
            </Col>
          </Row>

          <Divider />

          <ListView
            items={this.state.records}
            columns={this.tableColumns()}
            keyProp="id"
            setPageTitle={() => {}}
          />
        </Card>

        <PermissionsModal
          visible={this.state.permissionsModalVisible}
          record={this.state.currentRecord}
          permissions={this.state.currentPermissions}
          hideModalCallback={this.hidePermissionsModal}
        />
      </div>
    );
  }
}
