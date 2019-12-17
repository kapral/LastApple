import { Component } from "react";
import * as React from "react";
import { LastfmAuthManager } from "./LastfmAuthManager";
import { NavLink } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";

type HeaderProps = BaseRouterProps & { showNav: boolean };

@inject('appState')
@observer
export class Header extends Component<HeaderProps> {
    render() {
        return <div className={'header clearfix'} style={{
            background: '#000',
            padding: `10px 10px ${this.props.showNav ? 0 : 10}px`,
            paddingTop: 'env(safe-area-inset-top)'
        }}>
            <div>
                <h2 style={{
                    fontSize: '30px',
                    margin: '5px 0',
                    color: '#DDD',
                    textAlign: 'center'
                }}>last apple</h2>
                { this.props.showNav && <div>
                    <div className={'lastfm-auth-container'} style={{ float: 'right', marginTop: '10px', maxWidth: 'calc(100% - 190px)' }}>
                        <LastfmAuthManager appState={this.props.appState} />
                    </div>
                    <NavLink activeStyle={{ background: '#222' }} style={{ color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' }} exact to={'/'}>New station</NavLink>
                    {this.props.appState.latestStationId && <NavLink activeStyle={{ background: '#0E0E0E' }} style={{ color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' }}  to={`/station/${this.props.appState.latestStationId}`}>Now playing</NavLink> }
                </div>}
            </div>
        </div>;
    }
}