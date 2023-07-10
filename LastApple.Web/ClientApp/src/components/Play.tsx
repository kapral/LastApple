import React, {Component} from "react";
import { StationPlayer } from "./Player/StationPlayer";
import { BaseRouterProps } from "../BaseRouterProps";
import { AppContext } from '../AppContext';

interface PlayProps extends BaseRouterProps {
    showPlayer: boolean;
    stationId: string;
}

export class Play extends Component<PlayProps> {
    static contextType = AppContext;
    context: React.ContextType<typeof AppContext>;

    private get stationId(): string {
        return this.props.stationId || this.context.latestStationId;
    }

    componentDidMount(): void {
        this.updateLatestStationId();
    }

    componentDidUpdate(): void {
        this.updateLatestStationId();
    }

    updateLatestStationId() {
        if (this.context.latestStationId !== this.stationId) {
            this.context.setLatestStationId(this.stationId);
        }
    }

    render() {
        const stationId = this.stationId;

        if (!stationId)
            return null;

        return <div style={{ display: this.props.showPlayer ? 'block' : 'none' }}>
            <StationPlayer stationId={stationId} />
        </div>;
    }
}