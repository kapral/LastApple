import { Component } from 'react';
import { MobileUtil } from '../../Mobile/MobileUtil';

export class CaptureSessionId extends Component<{}, {}> {
    componentDidMount() {
        window.location.assign(MobileUtil.formatAppUrl());
    }

    render() {
        return null;
    }
}