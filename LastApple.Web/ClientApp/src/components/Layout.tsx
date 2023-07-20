import React, { Component } from 'react';
import { Footer } from './Footer';

const styles = {
    backgroundColor: '#222',
    color: '#CCC',
    maxWidth: '900px',
    margin: '0 auto'
};

export class Layout extends Component<React.PropsWithChildren<{}>> {
    displayName = Layout.name

    render() {
        return <div style={styles}>
            {this.props.children}
            <Footer />
        </div>;
    }
}
