import React from "react";
import {NavLink, useLocation} from "react-router-dom";
import {settingsRoute} from "../App";
import {useAppleContext} from "../apple/AppleContext";
import {AuthenticationState} from "../authentication";

export const AppleUnauthenticatedWarning: React.FunctionComponent = () => {
    const context = useAppleContext();
    const location = useLocation();

    const isAuthenticatedOrLoading = context.authentication.state !== AuthenticationState.Unauthenticated;
    const isSettingsRoute =  location.pathname.includes(settingsRoute);

    if (isAuthenticatedOrLoading || isSettingsRoute) {
        return undefined;
    }

    return (
        <div className='alert alert-warning'>
            You have no Apple Music account connected and can listen only to 30 second previews. Log in to Apple
            Music on the <NavLink to={'/settings'}>Settings</NavLink> tab to enjoy full songs!
        </div>
    );
}