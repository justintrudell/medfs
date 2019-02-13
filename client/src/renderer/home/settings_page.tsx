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
    getLogin()
      .then(result => {
        if (!result || _.isEmpty(result)) {
          throw new Error(ERR_UNKNOWN);
        } else {
          this.setState({ isLoading: false, error: undefined, user: result });
          this.getInfo();
        }
      })
      .catch((err: Error) => {
        this.setState({ isLoading: false, error: err });
      });
  }

  getInfo() {
    if (this.state.user === undefined) {
      return;
    }

    if (this.state.user.isDoctor) {
      // get doctor info
      return;
    }

    getPatientInfo().then((info: PatientInfo) => {
      this.setState({ info });
    }).catch((err: Error) => {
      console.error(err);
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

  getFirstName() {
    return this.state.info !== undefined ? this.state.info!.firstName : "";
  }

  getLastName() {
    return this.state.info !== undefined ? this.state.info.lastName : "";
  }

  getBloodType() {
    return this.state.info !== undefined ? this.state.info.bloodType : "";
  }

  getSex() {
    return this.state.info !== undefined ? this.state.info.sex : "";
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
      this.getInfo();
    }).catch((err: Error) => {
      console.error(err);
      message.error("Something went wrong!");
    });
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
    const tailFormItemLayout = {
      wrapperCol: {
        sm: {
          span: 8,
          offset: 4,
        },
      },
    };

    return (
      <Card title="Your Settings">
        <Form>
          <Form.Item {...formItemLayout} label="E-mail">
            <Input placeholder="me@medfs.com" value={this.state.user!.email} disabled={true} />
          </Form.Item>
          <Form.Item {...formItemLayout}  label="First Name">
            <Input placeholder="Vishal" value={this.getFirstName()} onChange={this.handleFirstNameChange}/>
          </Form.Item>
          <Form.Item {...formItemLayout} label="Last Name">
            <Input placeholder="Kuo" value={this.getLastName()} onChange={this.handleLastNameChange}/>
          </Form.Item>
          <Form.Item {...formItemLayout} label="Date of Birth" >
            <DatePicker value={this.getDateOfBirth()} onChange={this.handleDOBChange}/>
          </Form.Item>
          <Form.Item {...formItemLayout} label="Blood Type">
            <Select id="blood" value={this.getBloodType()} key="bloodtype" placeholder="--" onChange={this.handleBloodTypeChange}>
              {Object.values(BloodType).map(key => {
                return (
                  <Select.Option value={key}>{key}</Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item {...formItemLayout} label="Sex">
            <Select id="sex" key="sex" value={this.getSex()} placeholder="--" onChange={this.handleSexChange}>
              {Object.values(Sex).map(key => {
                return (
                  <Select.Option value={key}>{key}</Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button onClick={this.handleSubmit} type="primary" htmlType="submit" className="login-form-button">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}
