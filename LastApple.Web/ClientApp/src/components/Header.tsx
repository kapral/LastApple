import * as React from "react";
import {Component} from "react";
import {NavLink} from "react-router-dom";
import {BaseRouterProps} from "../BaseRouterProps";
import logo from '../images/logo.png';
import {AppContext} from '../AppContext';
import {LastfmAvatar} from "./LastfmAvatar";

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

export class Header extends Component<HeaderProps> {
    static contextType = AppContext;
    context: React.ContextType<typeof AppContext>;

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
                    {this.props.showLastfm && <LastfmAvatar />}
                </div>
            </div>

            {this.props.showNav &&
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <NavLink activeStyle={activeNavLinkStyle} style={navLinkStyle} exact to={'/'}>New station</NavLink>
                    {this.context.latestStationId &&
                        <NavLink activeStyle={{ background: '#0E0E0E' }} style={navLinkStyle}
                                 to={`/station/${this.context.latestStationId}`}>Now playing</NavLink>
                    }
                    <NavLink style={navLinkStyle} activeStyle={{ background: '#0E0E0E' }} to='/settings'>Settings</NavLink>
                </div>
            }
        </div>;
    }
}