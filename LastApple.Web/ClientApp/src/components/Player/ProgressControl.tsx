import * as React from 'react';

const progressStyles: React.CSSProperties = {
    width: '100%',
    height: '10px',
    borderRadius: '2px',
    position: 'relative',
    cursor: 'pointer'
};

const bufferingStyles: React.CSSProperties = {
    height: '10px',
    background: '#40404054',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    borderRadius: '2px'
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

interface IProgressParams {
    bufferingPercent: number;
    playingPercent: number;
    duration: number;
    onPositionChange: (position: number) => void;
}

export class ProgressControl extends React.Component<IProgressParams, { rewindPosition: number }> {
    constructor(props) {

        super(props);

        this.state = { rewindPosition: 0 };
    }

    public render() {
        const rewindPercent = this.state.rewindPosition / this.props.duration * 100;

        return <div onMouseMove={e => this.handleMove(e)} onMouseUp={() => this.handleClick()} onMouseLeave={() => this.handleMouseLeave()} style={{ padding: '5px 0', cursor: 'pointer' }}>
            <div className="audio-progress" style={progressStyles}>

                   <div className="buffering-progress" style={{
                       width: `${this.props.bufferingPercent}%`,
                       ...bufferingStyles
                   }}></div>
                   <div className="playing-progress" style={{
                       width: `${this.props.playingPercent}%`,
                       display: rewindPercent !== 0 ? 'none' : 'block',
                       ...playingStyles
                   }}></div>
                   <div className="playing-progress" style={{ width: `${rewindPercent}%`, ...playingStyles }}></div>
               </div>
        </div>;
    }

    private handleMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getClientRects()[0];
        const rewindPosition = e.nativeEvent.offsetX * this.props.duration / rect.width;

        if(Math.abs(this.state.rewindPosition - rewindPosition) < 1) {
            return;
        }

        this.setState({ rewindPosition });
    }

    private handleClick() {
        this.props.onPositionChange(this.state.rewindPosition);
    }

    private handleMouseLeave() {
        this.setState({ rewindPosition: 0 });
    }
}
