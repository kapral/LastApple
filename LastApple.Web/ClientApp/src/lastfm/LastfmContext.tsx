import * as React from 'react';
import { AuthenticationState } from "../authentication";
import { assertNonNullable } from "../utils/mics";
import { ILastfmUser } from "../restClients/LastfmApi";
import { ILastfmAuthenticationState } from './lastfmAuthentication';

interface ILastfmContext {
    readonly authentication: ILastfmAuthenticationState;
    readonly isScrobblingEnabled: boolean;
    readonly setIsScrobblingEnabled: (value: boolean) => void;
}

export const LastfmContext = React.createContext<ILastfmContext | undefined>(undefined);

export const useLastfmContext = () => {
    const context = React.useContext(LastfmContext);
    assertNonNullable(context);
    return context;
}

interface ILastfmContextProviderProps { }

export const LastfmContextProvider: React.FunctionComponent<React.PropsWithChildren<ILastfmContextProviderProps>> =
    (props: React.PropsWithChildren<ILastfmContextProviderProps>) => {
        const [state, _setState] = React.useState<AuthenticationState>(AuthenticationState.Loading);
        const [user, _setUser] = React.useState<ILastfmUser | undefined>(undefined);
        const [isScrobblingEnabled, _setIsScrobblingEnabled] = React.useState<boolean>(false);

        const setState = React.useCallback(
            (value: AuthenticationState) => _setState(value),
            []
        );

        const setUser = React.useCallback(
            (value: ILastfmUser | undefined) => _setUser(value),
            []
        );

        const setIsScrobblingEnabled = React.useCallback(
            (value: boolean) => _setIsScrobblingEnabled(value),
            []
        );

        const value = {
            authentication: {
                state,
                setState,
                user,
                setUser
            },
            isScrobblingEnabled,
            setIsScrobblingEnabled
        };

        return (
            <LastfmContext.Provider value={value}>
                {props.children}
            </LastfmContext.Provider>
        );
    };