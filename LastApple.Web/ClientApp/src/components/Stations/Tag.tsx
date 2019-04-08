import React, { Component } from "react";
import { Redirect } from "react-router";

export class Tag extends Component<{}, { tagName: string, stationId: string, redirect: boolean }> {
    constructor(props) {
        super(props);

        this.state = {
            tagName: null, stationId: null, redirect: false
        };
    }

    async playStation() {
        const apiResponse = await fetch(`api/station/tag/${this.state.tagName}`, { method: 'POST' });

        this.setState({
            stationId: (await apiResponse.json()).id,
            redirect: true
        });
    }

    setTag(tag) {
        this.setState({ tagName: tag });
    }

    render(): React.ReactNode {
        if (this.state.redirect)
            return <Redirect to={`/station/${this.state.stationId}`}/>

        return <div className={'clearfix'} style={{ background: '#C8C8C8', padding: '10px' }}>
            <h5 style={{ color: '#151515' }}>One tag</h5>
            <input placeholder={'Type tag'} type={'text'} onChange={e => this.setTag(e.currentTarget.value)}/>
            <button style={{
                float: 'right',
                margin: '10px 0 5px',
                background: '#100404',
                border: 'none',
                padding: '10px',
                color: '#C8C8C8'
            }} onClick={() => this.playStation()}>Play Station
            </button>
        </div>
    }
}