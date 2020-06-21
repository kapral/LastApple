import { Component } from "react";
import * as React from "react";
import LastfmAuthManager from "./LastfmAuthManager";
import { NavLink } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";
import logo from '../images/logo.png';

type HeaderProps = BaseRouterProps & {
    showNav: boolean;
    showLastfm: boolean;
};

const navLinkStyle = { color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' };
const activeNavLinkStyle = { background: '#222' };

const titleStyles: React.CSSProperties = {
    margin: '0',
    color: '#DDD',
    textAlign: 'center'
};

@inject('appState')
@observer
export class Header extends Component<HeaderProps> {
    render() {
        const headerStyles: React.CSSProperties = {
            background: '#000',
            padding: `10px 10px ${this.props.showNav ? 0 : 10}px`,
            paddingTop: 'max(env(safe-area-inset-top), 10px)'
        };

        return <div className='header' style={headerStyles}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}></div>
                <div className='title-container' style={{ flex: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img className='logo' src={logo} alt='logo' style={{ margin: '0 10px 3px 0' }} />
                    <h2 style={titleStyles}>lastream</h2>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {this.props.showLastfm &&
                        <LastfmAuthManager {...this.props} />
                    }
                </div>
            </div>

            {this.props.showNav &&
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <NavLink activeStyle={activeNavLinkStyle} style={navLinkStyle} exact to={'/'}>New station</NavLink>
                    {this.props.appState.latestStationId &&
                        <NavLink activeStyle={{ background: '#0E0E0E' }} style={navLinkStyle}
                                 to={`/station/${this.props.appState.latestStationId}`}>Now playing</NavLink>
                    }
                    <NavLink style={navLinkStyle} activeStyle={{ background: '#0E0E0E' }} to='/settings'>Settings</NavLink>
                </div>
            }
        </div>;
    }
}