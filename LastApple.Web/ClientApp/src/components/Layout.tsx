import React, { Component } from 'react';

const styles = {
    backgroundColor: '#222',
    color: '#CCC',
    maxWidth: '800px',
    margin: '0 auto'
};

export class Layout extends Component {
    displayName = Layout.name

    render() {
        return <div style={styles}>
            {this.props.children}
        </div>;
    }
}
