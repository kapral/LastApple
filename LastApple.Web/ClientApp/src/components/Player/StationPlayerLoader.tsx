import React from 'react';
import { Spinner } from 'react-bootstrap';

const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px'
};

export const StationPlayerLoader: React.FC = () => (
    <div style={containerStyles}>
        <Spinner animation="border" data-testid="spinner" />
    </div>
);