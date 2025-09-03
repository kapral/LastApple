import React from 'react';
import {NavLink} from "react-router-dom";
import {useAppContext} from '../AppContext';
import {LastfmAvatar} from "./LastfmAvatar";

import logo from '../images/logo.png';

const navLinkStyle = { color: '#DDD', padding: '10px', textDecoration: 'none', display: 'inline-block' };
const activeNavLinkStyle = { background: '#222' };

const titleStyles: React.CSSProperties = {
    margin: '0',
    color: '#DDD',
    textAlign: 'center'
};

export const Header: React.FunctionComponent = () => {
    const appContext = useAppContext();

    const headerStyles: React.CSSProperties = {
        background: '#000',
        padding: `10px 10px 0`,
        paddingTop: 'max(env(safe-area-inset-top), 10px)'
    };

    return (
        <div className='header' style={headerStyles}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}></div>
                <div className='title-container' style={{ flex: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img className='logo' src={logo} alt='logo' style={{ margin: '0 10px 3px 0' }} />
                    <h2 style={titleStyles}>lastream</h2>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <LastfmAvatar />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <NavLink activeStyle={activeNavLinkStyle} style={navLinkStyle} exact to={'/'}>New station</NavLink>
                {appContext.latestStationId &&
                    <NavLink activeStyle={{ background: '#0E0E0E' }} style={navLinkStyle}
                             to={`/station/${appContext.latestStationId}`}>Now playing</NavLink>
                }
                <NavLink style={navLinkStyle} activeStyle={{ background: '#0E0E0E' }} to='/settings'>Settings</NavLink>
            </div>
        </div>
    );
};