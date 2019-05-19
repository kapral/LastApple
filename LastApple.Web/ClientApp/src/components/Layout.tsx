import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';

const styles = {
    backgroundColor: '#222',
    color: '#CCC',
    maxWidth: '800px',
    margin: '0 auto'
};

export class Layout extends Component {
    displayName = Layout.name

    render() {
        return (
            <Grid fluid>
                <Row>
                    <div style={styles}>
                        {this.props.children}
                    </div>
                </Row>
            </Grid>
        );
    }
}
