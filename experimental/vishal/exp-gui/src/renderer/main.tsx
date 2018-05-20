//import styles
import '../../config/scss/vanilla/index.scss';

import * as React from 'react';
import App from 'grommet/components/App';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Title from 'grommet/components/Title';
import Sidebar from 'grommet/components/Sidebar';
import Button from 'grommet/components/Button'
import Anchor from 'grommet/components/Anchor';

export default class extends React.Component {
  render() {
    return (
      <App centered={false}>  
        <Sidebar colorIndex='neutral-1' size="small">
          <Header pad="medium" justify="between">
            <Title>medFS</Title>
          </Header>
          <Box flex="grow" justify="start">
            <Menu primary={true}>
              <Anchor href="#" >
                Records
              </Anchor>
              <Anchor href="#" >
                Access Requests
              </Anchor>
              <Anchor href="#" >
                Profile
              </Anchor>
            </Menu>
          </Box>
          <Footer pad="medium">
            <Button>
              Settings
            </Button>
          </Footer>
        </Sidebar>
      </App>
    );
  }
};
