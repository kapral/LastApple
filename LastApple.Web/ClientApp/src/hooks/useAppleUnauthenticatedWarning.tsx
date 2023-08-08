import * as React from 'react';
import {useAppleContext} from "../apple/AppleContext";
import {AuthenticationState} from "../authentication";
import {AppleUnauthenticatedWarning} from "../components/AppleUnauthenticatedWarning";

export const useAppleUnauthenticatedWarning = () => {
    const appleContext = useAppleContext();

    const isShown = React.useMemo(
        () => appleContext.authentication.state === AuthenticationState.Unauthenticated,
        [appleContext.authentication.state]
    );

    const Element = React.useMemo(
        () => <AppleUnauthenticatedWarning />,
        []
    );

    return {
        isShown,
        Element
    };
}