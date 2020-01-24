import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export const Footer = () => <div style={{ display: 'flex', justifyContent: 'center', background: '#0e0e0e', padding: '10px 20px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <a  href='https://twitter.com/vitaliykapral'
            target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={["fab", 'twitter']} style={{ fontSize: '1.5rem', color: '#1ea1f2' }} />
        </a>
        <span style={{ fontSize: '13px', color: '#AAA' }}>Have an issue or an idea?</span>
    </div>
</div>;