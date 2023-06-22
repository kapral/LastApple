import * as React from 'react';
import musicKit from '../../musicKit';

const progressStyles: React.CSSProperties = {
    width: '100%',
    height: '10px',
    borderRadius: '2px',
    position: 'relative',
    cursor: 'pointer',
    background: '#40404054'
};

const playingStyles: React.CSSProperties = {
    height: '10px',
    background: '#e0e0e066',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    borderRadius: '2px'
};

export class ProgressControl extends React.Component<{}, { rewindPosition: number, currentPlaybackPercent: number, currentPlaybackTime: number; }> {
    private readonly timeChangeHandler: <T extends keyof MusicKit.Events>(x: MusicKit.Events[T]) => void;
    constructor(props) {

        super(props);

        this.state = { rewindPosition: 0, currentPlaybackPercent: 0, currentPlaybackTime: 0 };

        this.timeChangeHandler = x => this.handlePlaybackTimeChanged(x);
    }

    componentDidMount(): void {
        musicKit.instance.addEventListener('playbackTimeDidChange', this.timeChangeHandler);
    }

    componentWillUnmount(): void {
        musicKit.instance.removeEventListener('playbackTimeDidChange', this.timeChangeHandler);
    }

    public render() {
        const rewindPercent = this.state.rewindPosition / musicKit.instance.currentPlaybackDuration * 100;

        return <div>
            <span style={{ display: 'inline-block', verticalAlign: 'top', marginTop: '2px' }}>{musicKit.formatMediaTime(this.state.currentPlaybackTime)}</span>
            <div style={{
                display: 'inline-block',
                width: 'calc(100% - 100px)',
                margin: '0 15px'
            }}>
                <div onMouseMove={e => this.handleMove(e)} onMouseUp={() => this.handleClick()} onMouseLeave={() => this.handleMouseLeave()} style={{ padding: '5px 0', cursor: 'pointer' }}>
                    <div className="audio-progress" style={progressStyles}>
                        <div className="playing-progress" style={{
                               width: `${this.state.currentPlaybackPercent}%`,
                               display: rewindPercent !== 0 ? 'none' : 'block',
                               ...playingStyles
                           }}></div>
                        <div className="playing-progress" style={{ width: `${rewindPercent}%`, ...playingStyles }}></div>
                    </div>
                </div>
            </div>
            <span style={{ display: 'inline-block', verticalAlign: 'top', marginTop: '2px' }}>{musicKit.formatMediaTime(musicKit.instance.currentPlaybackDuration)}</span>
        </div>;
    }

    handlePlaybackTimeChanged(event) {
        const currentPlaybackTime = event.currentPlaybackTime;
        const currentPlaybackDuration = event.currentPlaybackDuration;

        if(event.currentPlaybackDuration === 0 || !Number.isFinite(event.currentPlaybackDuration)) {
            this.setState({ currentPlaybackTime: event.currentPlaybackTime, currentPlaybackPercent: 0 });
        }

        if(currentPlaybackTime === this.state.currentPlaybackTime) {
            const diff = 1 / currentPlaybackDuration / 4 * 100;

            this.setState({ currentPlaybackPercent: this.state.currentPlaybackPercent + diff });

            return;
        }

        const currentPlaybackPercent = currentPlaybackTime / currentPlaybackDuration * 100;
        this.setState({ currentPlaybackTime, currentPlaybackPercent });
    }

    private handleMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getClientRects()[0];
        const rewindPosition = e.nativeEvent.offsetX * musicKit.instance.currentPlaybackDuration / rect.width;

        if(Math.abs(this.state.rewindPosition - rewindPosition) < 1) {
            return;
        }

        this.setState({ rewindPosition });
    }

    private async handleClick() {
        await this.handleSeek(this.state.rewindPosition);
    }

    async handleSeek(time) {
        this.setState({ currentPlaybackPercent: (time / musicKit.instance.currentPlaybackDuration) * 100 });
        await musicKit.instance.seekToTime(time);
    }

    private handleMouseLeave() {
        this.setState({ rewindPosition: 0 });
    }
}
