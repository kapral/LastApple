import React from 'react';
import lastfmAuthService from "../lastfm/LastfmAuthService";
import { useLastfmContext } from "../lastfm/LastfmContext";
import { AuthenticationState } from "../authentication";
import { checkLastfmLogin } from '../lastfm/lastfmAuthentication';

export const useStartupLastfmAuthenticationCheck = () => {
    const context = useLastfmContext();

    React.useEffect(
        () => {
            (async () => {
                context.authentication.setState(AuthenticationState.Loading);

                const token = lastfmAuthService.tryGetAuthFromParams();

                if (!!token) {
                    await lastfmAuthService.postToken(token);
                }

                await checkLastfmLogin(context.authentication);
            })()
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
};

