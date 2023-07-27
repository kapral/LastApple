import * as React from 'react';
import {assertNonNullable} from "./utils/mics";

interface IAppContext {
    readonly latestStationId: string | undefined;
    readonly setLatestStationId: (value: string | undefined) => void;
}

export const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const useAppContext = () => {
    const context = React.useContext(AppContext);
    assertNonNullable(context);
    return context;
}

interface IAppContextProviderProps { }

export const AppContextProvider: React.FunctionComponent<React.PropsWithChildren<IAppContextProviderProps>> =
    (props: React.PropsWithChildren<IAppContextProviderProps>) => {
        const [latestStationId, _setLatestStationId] = React.useState<string | undefined>(undefined);

        const setLatestStationId = React.useCallback(
            (value: string | undefined) => _setLatestStationId(value),
            []
        );

        const value = {
            latestStationId,
            setLatestStationId
        };

        return (
            <AppContext.Provider value={value}>
                {props.children}
            </AppContext.Provider>
        );
    };