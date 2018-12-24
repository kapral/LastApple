import React, { Component } from 'react';
import {PlayerControl} from "./Player/PlayerControl";


export class Home extends Component {
  displayName = Home.name

  render() {
      return <div>
            <PlayerControl/>
      </div>;
  }
}
