import React from "react";
import {NavLink} from "react-router-dom";
import {settingsRoute} from "../routes";

export const AppleUnauthenticatedWarning: React.FunctionComponent = () =>
    <div className='alert alert-warning'>
        You have no Apple Music account connected and can listen only to 30 second previews. Log in to Apple
        Music on the <NavLink to={settingsRoute}>Settings</NavLink> tab to enjoy full songs!
    </div>;