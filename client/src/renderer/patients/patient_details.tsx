import * as React from "react";
import { match } from "react-router";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Statistic, Divider } from "antd";
import { getPatientInfo } from "../../api/patients";
import { PatientInfo } from "../../models/patients";
import { RecordItem } from "../../models/records";
import { ColumnProps } from "antd/lib/table";
import { ListView } from "../components/lists/listView";

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
  PatientDetailsState
  > {
  constructor(props: PatientDetailsProps) {
    super(props);

    this.state = {
      info: undefined
    };
  }

  componentDidMount() {
    getPatientInfo(this.props.match.params.patient_id).then(info => {
      this.setState({ info });
    }).catch(err => {
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
  }

  getDOB = (): string => {
    const info = this.state.info;
    if (info !== undefined && info.dateOfBirth !== null) {
      return info.dateOfBirth.getFullYear() + "-" + (info.dateOfBirth.getMonth() + 1) + "-" + info.dateOfBirth.getDate();
    }
    return "Unknown";
  }

  getBloodType = (): string => {
    const info = this.state.info;
    if (info !== undefined && info.bloodType !== null) {
      return info.bloodType as string;
    }
    return "Unknown";
  }

  getSex = (): string => {
    const info = this.state.info;
    if (info !== undefined && info.sex !== null) {
      return info.sex as string;
    }
    return "Unknown";
  }

  tableColumns = (): Array<ColumnProps<RecordItem>> => {
    return [
      {
        title: "File",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Shared With",
        dataIndex: "shared_with",
        key: "shared_with",
      },
      {
        title: "Created At",
        key: "created_at",
      },
      {
        title: "Actions",
        key: "action",
      }
    ];
  };

  render() {
    return (
      <Card
        title={this.getPageTitle()}
        extra={
          <Link to="/uploads">
            <Button type="primary" icon="plus">
              Add Document
            </Button>
          </Link>
        }
      >
        <Row gutter={32}>
          <Col span={6}>
            <Statistic title="Date of Birth" value={this.getDOB()}/>
          </Col>
          <Col span={6}>
            <Statistic title="Blood Type" value={this.getBloodType()}/>
          </Col>
          <Col span={6}>
            <Statistic title="Sex" value={this.getSex()}/>
          </Col>
        </Row>

        <Divider />

      {/*TODO: GET PATIENT SPECIFIC RECORDS AND DISPLAY IN TABLE*/}
        <ListView
          items={[]}
          columns={this.tableColumns()}
          keyProp="id"
          setPageTitle={()=>{}}
        />
      </Card>
    );
  }
}
