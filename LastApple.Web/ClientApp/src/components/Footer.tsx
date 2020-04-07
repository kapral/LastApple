import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appStoreBadge from '../images/app-store-badge.svg';
import React from 'react';

export const Footer = () => <div style={{ display: 'flex', justifyContent: 'center', background: '#0e0e0e', padding: '10px 20px' }}>
    <a href={'https://apps.apple.com/app/lastream/id1483386771'}>
        <img src={appStoreBadge} />
    </a>
    <div style={{ display: 'flex', alignItems: 'center', width: '120px', padding: '2px 5px', marginLeft: '25px', border: '1px solid #A6A6A6', borderRadius: '5px', background: '#000' }}>
        <a style={{ color: '#FFF', display: 'flex', alignItems: 'center', width: '100%', textDecoration: 'none' }}
            href='https://twitter.com/vitaliykapral'
            target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={["fab", 'twitter']} style={{ fontSize: '1.5rem', marginRight: '5px', marginLeft: '5px', color: '#1ea1f2' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', alignItems: 'center', flex: 1, fontFamily: 'Open Sans', marginTop: '3px' }}>
                <span style={{ fontSize: '9px' }}>Reach me on</span>
                <span style={{ fontSize: '16px' }}>Twitter</span>
            </div>
        </a>
    </div>
</div>;