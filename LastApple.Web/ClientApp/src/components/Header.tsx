import { Component } from "react";
import * as React from "react";
import { LastfmAuthManager } from "./LastfmAuthManager";
import { NavLink } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";

type HeaderProps = BaseRouterProps & { 
    showNav: boolean;
    showLastfm: boolean;
};

const navLinkStyle = { color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' };
const activeNavLinkStyle = { background: '#222' };

const titleStyles: React.CSSProperties = {
    fontSize: '30px',
    margin: '5px 0',
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
            paddingTop: 'calc(env(safe-area-inset-top) + 10px)'
        };

        return <div className={'header clearfix'} style={headerStyles}>
            <div>
                <h2 style={titleStyles}>last apple</h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        {this.props.showNav && <>
                            <NavLink activeStyle={activeNavLinkStyle} style={navLinkStyle} exact to={'/'}>New station</NavLink>
                            {this.props.appState.latestStationId &&
                                <NavLink activeStyle={{ background: '#0E0E0E' }} style={navLinkStyle} to={`/station/${this.props.appState.latestStationId}`}>Now playing</NavLink>
                            }
                            <NavLink style={navLinkStyle} activeStyle={activeNavLinkStyle} to='/settings'>Settings</NavLink>
                        </>}
                    </div>
                    {this.props.showLastfm &&
                        <LastfmAuthManager {...this.props} />
                    }
                </div>
            </div>
        </div>;
    }
}