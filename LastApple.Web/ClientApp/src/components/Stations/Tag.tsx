import React, { Component } from "react";

export class Tag extends Component<{ submit: boolean, onCreated(id: string): void }, { tagName: string }> {
    constructor(props) {
        super(props);

        this.state = { tagName: null };
    }

    async componentDidUpdate() {
        if (this.props.submit) {
            const apiResponse = await fetch(`api/station/tags/${this.state.tagName}`, { method: 'POST' });

            this.props.onCreated((await apiResponse.json()).id);
        }
    }

    render(): React.ReactNode {
        return <div className={'station-parameters'} style={{ padding: '10px' }}>
            <input style={{ color: '#555', width: '100%', padding: '6px 12px', borderWidth: '1px' }}
                   placeholder={'Type tag'}
                   type={'text'}
                   onChange={e => this.setState({ tagName: e.currentTarget.value })}/>
        </div>
    }

    static Definition = {
        title: 'Tag',
        description: 'Play a continuous station of tracks related to a lastfm tag.',
        type: Tag
    };
}