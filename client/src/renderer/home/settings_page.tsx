import * as React from "react";
import { Spin, Card, Button } from "antd";
import * as _ from "lodash";
import { getLogin } from "../../utils/loginUtils";
import { logout } from "../../api/auth";
import { ERR_UNKNOWN } from "../../models/errors";
import { UserInternal } from "../../models/users";
import { updateIsLoggedIn } from "../app";

interface Props {
  stream?: EventSource;
  updateIsLoggedIn: updateIsLoggedIn;
}

interface State {
  isLoading: boolean;
  error: Error | undefined;
  user: UserInternal | undefined;
}

export class SettingsPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      error: undefined,
      user: undefined
    };
  }

  componentDidMount() {
    getLogin()
      .then(result => {
        if (!result || _.isEmpty(result)) {
          throw new Error(ERR_UNKNOWN);
        } else {
          this.setState({ isLoading: false, error: undefined, user: result });
        }
      })
      .catch((err: Error) => {
        this.setState({ isLoading: false, error: err });
      });
  }

  handleLogout = () => {
    logout()
      .then(res => {
        if (!res) {
          console.error("Something went wrong");
        }
        this.props.stream!.close();
        this.props.updateIsLoggedIn(undefined);
      })
      .catch(err => {
        console.error(err);
      });
  };

  render() {
    if (this.state.isLoading) {
      return <Spin />;
    }
    return (
      <Card title="Your Settings">
        <p>Email: {this.state.user!.email}</p>
        <Button onClick={this.handleLogout} type="danger">
          Logout
        </Button>
      </Card>
    );
  }
}
