import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlay, faSearch } from '@fortawesome/free-solid-svg-icons';
import { inject, observer } from 'mobx-react';

const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
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

const labelStyle: React.CSSProperties = {
  marginTop: '5px'  
};

export const MobileNav = inject('appState')(observer(props => <nav style={navStyle}>
    <NavLink style={linkStyle} activeStyle={activeLinkStyle} exact to={'/'}>
        <FontAwesomeIcon size='2x' icon={faSearch}/>
        <span style={labelStyle}>New Station</span>
    </NavLink>
    <NavLink style={{...linkStyle, ...{pointerEvents: props.appState.latestStationId ? 'all' : 'none'}}} 
             activeStyle={activeLinkStyle} 
             to={`/station/${props.appState.latestStationId}`}>
        <FontAwesomeIcon size='2x' icon={faPlay}/>
        <span style={labelStyle}>Now Playing</span>
    </NavLink>
    <NavLink style={linkStyle} activeStyle={activeLinkStyle} to={`/settings`}>
        <FontAwesomeIcon size='2x' icon={faCog}/>
        <span style={labelStyle}>Settings</span>
    </NavLink>
</nav>));