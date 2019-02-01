import * as React from "react";
import { Spin, Card } from "antd";
import * as _ from "lodash";
import { getLogin } from "../../utils/loginUtils";
import { ERR_UNKNOWN } from "../../models/errors";
import { UserInternal } from "../../models/users";

interface Props {
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

  render() {
    if (this.state.isLoading) {
      return <Spin />;
    }
    return (
      <Card title="Your Settings">
        <p>Email: {this.state.user!.email}</p>
      </Card>
    );
  }
}
