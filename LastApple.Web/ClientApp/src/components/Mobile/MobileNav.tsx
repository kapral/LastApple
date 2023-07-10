import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlay, faSearch } from '@fortawesome/free-solid-svg-icons';
import { BaseRouterProps } from '../../BaseRouterProps';
import { useAppContext } from '../../AppContext';

const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    display: 'flex',
    background: '#000'
};

const linkStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#DDD',
    fontSize: '10px',
    padding: '10px',
    paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
    textDecoration: 'none'
};

const activeLinkStyle: React.CSSProperties = {
    color: '#8e0000'
};

const disabledLinkStyle: React.CSSProperties = {
    pointerEvents: 'none',
    color: '#333'
};

const labelStyle: React.CSSProperties = {
  marginTop: '5px'
};

export const MobileNav = (_: BaseRouterProps) => {
    const context = useAppContext();

    return (
        <nav style={navStyle}>
            <NavLink style={linkStyle} activeStyle={activeLinkStyle} exact to={'/'}>
                <FontAwesomeIcon size='2x' icon={faSearch} />
                <span style={labelStyle}>New Station</span>
            </NavLink>
            <NavLink style={{ ...linkStyle, ...(!context.latestStationId ? disabledLinkStyle : {}) }}
                     activeStyle={activeLinkStyle}
                     to={`/station/${context.latestStationId}`}>
                <FontAwesomeIcon size='2x' icon={faPlay} />
                <span style={labelStyle}>Now Playing</span>
            </NavLink>
            <NavLink style={linkStyle} activeStyle={activeLinkStyle} to={`/settings`}>
                <FontAwesomeIcon size='2x' icon={faCog} />
                <span style={labelStyle}>Settings</span>
            </NavLink>
        </nav>
    );
};