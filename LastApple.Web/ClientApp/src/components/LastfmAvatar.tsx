import React from "react";
import { Spinner } from 'react-bootstrap';
import lastfmLogo from '../images/lastfm-logo.png'
import { useHistory } from "react-router";
import { useLastfmContext } from '../lastfm/LastfmContext';
import { AuthenticationState } from '../authentication';

export const LastfmAvatar = () => {
    const lastfmContext = useLastfmContext();
    const history = useHistory();

    const onClick = React.useCallback(
        () => {
            if (lastfmContext.authentication.user !== undefined)
                return;

            history.push('/settings');
        },
        [history, lastfmContext.authentication.user]
    );

    if (lastfmContext.authentication.state === AuthenticationState.Loading) {
        return (
            <div style={{ marginRight: '15px' }}>
                <Spinner animation="border" style={{ width: '20px', height: '20px' }} />
            </div>
        );
    }

    return (
        <div>
            <a style={{
                color: '#DDD',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
               className='lastfm-profile'
               href={lastfmContext.authentication.user && `https://www.last.fm/user/${lastfmContext.authentication.user.name}`}
               title={'Open lastfm profile'}
               target="_blank" rel="noopener noreferrer"
               onClick={onClick}>
                <img alt={''} style={{ borderRadius: '20px' }} src={lastfmContext.authentication.user?.avatar[0] ?? lastfmLogo} />
                <span>{lastfmContext.authentication.user?.name ?? 'Log in'}</span>
            </a>
        </div>
    );
}