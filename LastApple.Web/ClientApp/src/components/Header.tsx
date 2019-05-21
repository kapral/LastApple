import { Component } from "react";
import * as React from "react";
import { LastfmAuthManager } from "./LastfmAuthManager";
import { NavLink } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";

@inject('appState')
@observer
export class Header extends Component<BaseRouterProps> {
    render() {
        return <div className={'header'} style={{
            background: '#000',
            padding: '10px 10px 0'
        }}>
            <div>
                <h2 style={{
                    margin: '5px 0',
                    color: '#DDD',
                    textAlign: 'center'
                }}>last apple</h2>
                <div>
                    <div style={{ float: 'right', marginTop: '11px' }}>
                        <LastfmAuthManager/>
                    </div>
                    <NavLink activeStyle={{ background: '#222' }} style={{ color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' }} exact to={'/'}>New station</NavLink>
                    {this.props.appState.latestStationId && <NavLink activeStyle={{ background: '#0E0E0E' }} style={{ color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' }}  to={`/station/${this.props.appState.latestStationId}`}>Now playing</NavLink> }
                </div>
            </div>
        </div>;
    }
}