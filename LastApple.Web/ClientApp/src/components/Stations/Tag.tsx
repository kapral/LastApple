import React, { Component } from "react";
import { IStationParams } from "../IStationParams";

export class Tag extends Component<IStationParams, { tagName: string }> {
    constructor(props) {
        super(props);

        this.state = { tagName: null };
    }

    async componentDidUpdate() {
        if (this.props.triggerCreate) {
            const apiResponse = await fetch(`api/station/tags/${this.state.tagName}`, { method: 'POST' });

            this.props.onStationCreated((await apiResponse.json()).id);
        }
    }

    render(): React.ReactNode {
        return <div className={'station-parameters'} style={{ padding: '10px' }}>
            <input style={{ color: '#555', width: '100%', padding: '6px 12px', borderWidth: '1px' }}
                   placeholder={'Type a tag'}
                   type={'text'}
                   onChange={e => this.handleChanged(e.currentTarget.value)}/>
        </div>
    }

    handleChanged(tag: string) {
        this.setState({ tagName: tag });
        this.props.onOptionsChanged(!!tag);
    }

    static Definition = {
        title: 'Tag',
        description: 'A station consisting of tracks related to a last.fm tag.',
        type: Tag
    };
}