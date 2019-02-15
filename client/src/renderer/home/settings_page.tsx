import * as React from "react";
import { Spin, Card, Form, Input, DatePicker, Select, Button, message } from "antd";
import * as _ from "lodash";
import { getLogin } from "../../utils/loginUtils";
import { ERR_UNKNOWN } from "../../models/errors";
import { UserInternal } from "../../models/users";
import { getPatientInfo, updatePatientInfo } from "../../api/patients";
import { PatientInfo, BloodType, Sex } from "../../models/patients";
import * as moment from 'moment';

interface Props {
}

interface State {
  isLoading: boolean;
  error: Error | undefined;
  user: UserInternal | undefined;
  info: PatientInfo | undefined;
}

export class SettingsPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      error: undefined,
      user: undefined,
      info: undefined,
    };
  }

  componentDidMount() {
    Promise.all([getLogin(), getPatientInfo()]).then(result => {
      if (!result[0] || _.isEmpty(result[0])) {
        throw new Error(ERR_UNKNOWN);
      }
      this.setState({
        isLoading: false,
        error: undefined,
        user: result[0] as UserInternal,
        info: result[1] as PatientInfo,
      });
    }).catch(err => {
      this.setState({ isLoading: false, error: err });
    });
  }

  getPatientInfo() {
    getPatientInfo().then(info => {
      this.setState({ info });
    }).catch(err => {
      this.setState({ error: err });
    });
  }

  getPatientInfoObject() {
    return this.state.info !== undefined ? this.state.info : {} as PatientInfo;
  }

  getDateOfBirth() {
    if (this.state.info !== undefined && this.state.info.dateOfBirth !== null) {
      return moment(this.state.info.dateOfBirth);
    }
    return moment(new Date());
  }

  handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const i = this.getPatientInfoObject();
    i.firstName = event.target.value;
    this.setState({ info: i });
  }

  handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const i = this.getPatientInfoObject();
    i.lastName = event.target.value;
    this.setState({ info: i });
  }

  handleDOBChange = (date: moment.Moment) => {
    const i = this.getPatientInfoObject();
    i.dateOfBirth = date.toDate();
    this.setState({ info: i });
  }

  handleBloodTypeChange = (value: string) => {
    const i = this.getPatientInfoObject();
    i.bloodType = value as BloodType;
    this.setState({ info: i });
  }

  handleSexChange = (value: string) => {
    const i = this.getPatientInfoObject();
    i.sex = value as Sex;
    this.setState({ info: i });
  }

  handleSubmit = () => {
    updatePatientInfo(this.state.info!).then(resp => {
      message.success(resp);
      this.getPatientInfo();
    }).catch((err: Error) => {
      console.error(err);
      message.error("Something went wrong!");
    });
  }

  getPatientInfoForm = () => {
    if (this.state.user!.isDoctor) {
      return;
    }

    const formItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 8 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        sm: {
          span: 8,
          offset: 4,
        },
      },
    };

    return (
      <div>
        <Form.Item {...formItemLayout} label="First Name">
          <Input placeholder="Vishal" value={this.state.info!.firstName} onChange={this.handleFirstNameChange} />
        </Form.Item>
        <Form.Item {...formItemLayout} label="Last Name">
          <Input placeholder="Kuo" value={this.state.info!.lastName} onChange={this.handleLastNameChange} />
        </Form.Item>
        <Form.Item {...formItemLayout} label="Date of Birth" >
          <DatePicker value={this.getDateOfBirth()} onChange={this.handleDOBChange} />
        </Form.Item>
        <Form.Item {...formItemLayout} label="Blood Type">
          <Select value={this.state.info!.bloodType} placeholder="--" onChange={this.handleBloodTypeChange}>
            {Object.values(BloodType).map(key => {
              return (
                <Select.Option key={key} value={key}>{key}</Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item {...formItemLayout} label="Sex">
          <Select value={this.state.info!.sex} placeholder="--" onChange={this.handleSexChange}>
            {Object.values(Sex).map(key => {
              return (
                <Select.Option key={key} value={key}>{key}</Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button onClick={this.handleSubmit} type="primary" htmlType="submit" className="login-form-button">
            Save
          </Button>
        </Form.Item>
      </div>

    );
  }

  render() {
    if (this.state.isLoading) {
      return <Spin />;
    }
    const formItemLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 8 },
      },
    };

    return (
      <Card title="Your Settings">
        <Form>
          <Form.Item {...formItemLayout} label="E-mail">
            <Input placeholder="me@medfs.com" value={this.state.user && this.state.user.email} disabled={true} />
          </Form.Item>

          {this.state.user && this.state.info && this.getPatientInfoForm()}
        </Form>
      </Card>
    );
  }
}
