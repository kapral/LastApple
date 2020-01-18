import React, { Component } from "react";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";

export class Tag extends Component<IStationParams, { tagName: string }> {
    constructor(props) {
        super(props);

        this.state = { tagName: null };
    }

    async componentDidUpdate() {
        if (this.props.triggerCreate) {
            const station = await stationApi.postStation('tags', this.state.tagName);

            this.props.onStationCreated(station.id);
        }
    }

    render(): React.ReactNode {
        return <div className={'station-parameters'}>
            <input style={{ width: '100%', padding: '6px 12px', borderWidth: '1px' }}
                   placeholder={'Rock...'}
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