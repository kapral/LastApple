import * as React from 'react';
import { assertNonNullable } from './utils/mics';

interface IAppContextValues {
    readonly latestStationId?: string;
    readonly lastfmAuthenticated: boolean;
    readonly checkingLastfmAuth: boolean;
    readonly enableScrobbling: boolean;
}

interface IAppContext extends IAppContextValues {
    readonly setLatestStationId: (value: string | undefined) => void;
    readonly setLastfmAuthenticated: (value: boolean) => void;
    readonly setCheckingLastfmAuth: (value: boolean) => void;
    readonly setEnableScrobbling: (value: boolean) => void;
}

interface IAppContextProviderProps { }

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const AppContextProvider: React.FunctionComponent<React.PropsWithChildren<IAppContextProviderProps>> =
    (props: React.PropsWithChildren<IAppContextProviderProps>) => {
        const [latestStationId, setLatestStationId] = React.useState<string | undefined>(undefined);
        const [lastfmAuthenticated, setLastfmAuthenticated] = React.useState<boolean>(false);
        const [checkingLastfmAuth, setCheckingLastfmAuth] = React.useState<boolean>(false);
        const [enableScrobbling, setEnableScrobbling] = React.useState<boolean>(false);

        const value: IAppContext = {
            latestStationId,
            lastfmAuthenticated,
            checkingLastfmAuth,
            enableScrobbling,
            setLatestStationId,
            setLastfmAuthenticated,
            setCheckingLastfmAuth,
            setEnableScrobbling
        };

        return (
            <AppContext.Provider value={value}>
                {props.children}
            </AppContext.Provider>
        );
    };

export const useAppContext = () => {
    const context = React.useContext(AppContext);
    assertNonNullable(context);
    return context;
}