import React, { Component } from 'react';
import { StationsList } from "./StationsList";
import {useAppleUnauthenticatedWarning} from "../hooks/useAppleUnauthenticatedWarning";

export const Home: React.FunctionComponent = () => {
    const unauthenticatedWarning = useAppleUnauthenticatedWarning();

    return (
        <>
            {unauthenticatedWarning.isShown && unauthenticatedWarning.Element}
            <div>
                <StationsList />
            </div>
        </>
    );
}