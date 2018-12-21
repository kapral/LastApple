import React, { Component } from 'react';
import {PlayerControl} from "./Player/PlayerControl";


export class Home extends Component {
  displayName = Home.name

  render() {
      return <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#666' }}>Last Apple</h4>
            <PlayerControl/>
      </div>;
  }
}
