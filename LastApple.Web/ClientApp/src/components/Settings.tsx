import React from "react";
import appleMusicLogo from '../images/apple-music-logo.png';
import lastfmLogo from '../images/lastfm-logo.png';
import { Spinner } from 'react-bootstrap';
import ReactSwitch from "react-switch";
import { AuthenticationState } from '../authentication';
import { useAppleContext } from '../apple/AppleContext';
import { useLastfmContext } from '../lastfm/LastfmContext';
import { loginApple as serviceLoginApple, logoutApple as serviceLogoutApple } from '../apple/appleAuthentication';
import { loginLastfm as serviceLoginLastfm, logoutLastfm as serviceLogoutLastfm } from '../lastfm/lastfmAuthentication';

const rowStyles: React.CSSProperties = { flex: 1, display: 'flex', padding: '20px', alignItems: 'center', borderBottom: '1px solid #333' };
const logoStyles: React.CSSProperties = { height: '30px', marginRight: '15px' };

export const Settings: React.FunctionComponent = () => {
    const appleContext = useAppleContext();
    const lastfmContext = useLastfmContext();

    const loginApple = React.useCallback(
        async () => await serviceLoginApple(appleContext.authentication),
        [appleContext.authentication]
    );

    const logoutApple = React.useCallback(
        async () => await serviceLogoutApple(appleContext.authentication),
        [appleContext.authentication]
    );

    const loginLastfm = React.useCallback(
        async () => await serviceLoginLastfm(lastfmContext.authentication),
        [lastfmContext.authentication]
    );

    const logoutLastfm = React.useCallback(
        async () => await serviceLogoutLastfm(lastfmContext.authentication),
        [lastfmContext.authentication]
    );

    const isAppleAuthenticated = appleContext.authentication.state === AuthenticationState.Authenticated;
    const isLastfmAuthenticated = lastfmContext.authentication.state === AuthenticationState.Authenticated;

    const toggleAppleAuthentication = React.useCallback(
        async () =>
            isAppleAuthenticated
                ? await logoutApple()
                : await loginApple(),
        [isAppleAuthenticated, loginApple, logoutApple]
    );

    const toggleLastfmAuthentication = React.useCallback(
        async () =>
            isLastfmAuthenticated
                ? await logoutLastfm()
                : await loginLastfm(),
        [isLastfmAuthenticated, loginLastfm, logoutLastfm]
    );

    if (appleContext.authentication.state === AuthenticationState.Loading || lastfmContext.authentication.state === AuthenticationState.Loading)
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <Spinner animation="border" role="status" />
        </div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#0E0E0E', padding: '10px 25px'  }}>Connected accounts</div>
            <div style={rowStyles}>
                <img style={logoStyles} src={appleMusicLogo} alt='Apple Music Logo' />
                <div style={{ flex: 1 }}>Apple Music</div>
                <ReactSwitch
                    checked={isAppleAuthenticated}
                    onChange={toggleAppleAuthentication}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={22}
                    width={44}
                    offColor={'#888'}
                    onColor={'#8e0000'}
                    role="switch"
                />
            </div>
            <div style={rowStyles}>
                <img style={logoStyles} src={lastfmLogo} alt='Last.fm logo' />
                <div style={{ flex: 1 }}>Last.fm</div>
                <ReactSwitch
                    checked={isLastfmAuthenticated}
                    onChange={toggleLastfmAuthentication}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={22}
                    width={44}
                    offColor={'#888'}
                    onColor={'#8e0000'}
                    role="switch"
                />
            </div>
        </div>
    );
};