import React, { Component } from "react";

export class SimilarArtists extends Component<{submit: boolean, onCreated(id: string): void}, { artist: string }> {
    constructor(props) {
        super(props);

        this.state = {
            artist: null
        };
    }

    async componentDidUpdate() {
        if (this.props.submit) {
            const apiResponse = await fetch(`api/station/similarartists/${this.state.artist}`, { method: 'POST' });

            this.props.onCreated((await apiResponse.json()).id);
        }
    }

    render(): React.ReactNode {
        return <div className={'station-parameters'} style={{ padding: '10px' }}>
            <input style={{ color: '#555', width: '100%', padding: '6px 12px', borderWidth: '1px' }}
                   placeholder={'Type artist'}
                   type={'text'}
                   onChange={e => this.setState({ artist: e.currentTarget.value })}/>
        </div>
    }

    static Definition = {
        title: 'Similar Artists',
        description: 'Play a continuous station containing an artist and similar performers.',
        type: SimilarArtists
    };
}