import React from 'react';
import { AuthenticationState } from "../authentication";
import { assertNonNullable } from "../utils/mics";
import { IAppleAuthenticationState } from './appleAuthentication';

interface IAppleContext {
    readonly authentication: IAppleAuthenticationState;
}

const AppleContext = React.createContext<IAppleContext | undefined>(undefined);

export const useAppleContext = () => {
    const context = React.useContext(AppleContext);
    assertNonNullable(context);
    return context;
}

interface IAppleContextProviderProps { }

export const AppleContextProvider: React.FunctionComponent<React.PropsWithChildren<IAppleContextProviderProps>> =
    (props: React.PropsWithChildren<IAppleContextProviderProps>) => {
        const [state, _setState] = React.useState<AuthenticationState>(AuthenticationState.Loading);

        const setState = React.useCallback(
            (value: AuthenticationState) => _setState(value),
            []
        );

        const value = {
            authentication: {
                state,
                setState
            }
        };

        return (
            <AppleContext.Provider value={value}>
                {props.children}
            </AppleContext.Provider>
        )
    };

