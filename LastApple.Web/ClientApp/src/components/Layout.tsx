import React from 'react';
import { Footer } from './Footer';
import { Header } from "./Header";
import {useLocation} from "react-router-dom";
import {noNavRoutes} from "../routes";

const styles = {
    backgroundColor: '#222',
    color: '#CCC',
    maxWidth: '900px',
    margin: '0 auto'
};

export const Layout: React.FunctionComponent<React.PropsWithChildren> = (props: React.PropsWithChildren) => {
    const location = useLocation();

    const isNavShown = !noNavRoutes.some(r => location.pathname.includes(r));

    return (
        <div style={styles}>
            <Header showNav={isNavShown} showLastfm={isNavShown} />
            {props.children}
            <Footer/>
        </div>
    );
};