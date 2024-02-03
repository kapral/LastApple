import React from 'react';
import { Footer } from './Footer';
import { Header } from "./Header";

const styles = {
    backgroundColor: '#222',
    color: '#CCC',
    maxWidth: '900px',
    margin: '0 auto'
};

export const Layout: React.FunctionComponent<React.PropsWithChildren> = (props: React.PropsWithChildren) =>
    <div style={styles}>
        <Header />
        {props.children}
        <Footer/>
    </div>;