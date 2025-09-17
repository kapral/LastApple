import React, { useState, useEffect, useCallback } from 'react';
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

export const ProgressControl: React.FC = () => {
    const [rewindPosition, setRewindPosition] = useState(0);
    const [currentPlaybackPercent, setCurrentPlaybackPercent] = useState(0);
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

    const handlePlaybackTimeChanged = useCallback((event: any) => {
        const eventCurrentPlaybackTime = event.currentPlaybackTime;
        const currentPlaybackDuration = event.currentPlaybackDuration;

        if(event.currentPlaybackDuration === 0 || !Number.isFinite(event.currentPlaybackDuration)) {
            setCurrentPlaybackTime(event.currentPlaybackTime);
            setCurrentPlaybackPercent(0);
            return;
        }

        if(eventCurrentPlaybackTime === currentPlaybackTime) {
            const diff = 1 / currentPlaybackDuration / 4 * 100;
            setCurrentPlaybackPercent(prev => prev + diff);
            return;
        }

        const currentPlaybackPercent = eventCurrentPlaybackTime / currentPlaybackDuration * 100;
        setCurrentPlaybackTime(eventCurrentPlaybackTime);
        setCurrentPlaybackPercent(currentPlaybackPercent);
    }, [currentPlaybackTime]);

    useEffect(() => {
        musicKit.instance.addEventListener('playbackTimeDidChange', handlePlaybackTimeChanged);

        return () => {
            musicKit.instance.removeEventListener('playbackTimeDidChange', handlePlaybackTimeChanged);
        };
    }, [handlePlaybackTimeChanged]);

    const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getClientRects()[0];
        const newRewindPosition = e.nativeEvent.offsetX * musicKit.instance.currentPlaybackDuration / rect.width;

        if(Math.abs(rewindPosition - newRewindPosition) < 1) {
            return;
        }

        setRewindPosition(newRewindPosition);
    }, [rewindPosition]);

    const handleSeek = useCallback(async (time: number) => {
        setCurrentPlaybackPercent((time / musicKit.instance.currentPlaybackDuration) * 100);
        await musicKit.instance.seekToTime(time);
    }, []);

    const handleClick = useCallback(async () => {
        await handleSeek(rewindPosition);
    }, [rewindPosition, handleSeek]);

    const handleMouseLeave = useCallback(() => {
        setRewindPosition(0);
    }, []);

    const rewindPercent = rewindPosition / musicKit.instance.currentPlaybackDuration * 100;

    return <div>
        <span style={{ display: 'inline-block', verticalAlign: 'top', marginTop: '2px' }}>{musicKit.formatMediaTime(currentPlaybackTime)}</span>
        <div style={{
            display: 'inline-block',
            width: 'calc(100% - 100px)',
            margin: '0 15px'
        }}>
            <div onMouseMove={handleMove} onMouseUp={handleClick} onMouseLeave={handleMouseLeave} style={{ padding: '5px 0', cursor: 'pointer' }}>
                <div className="audio-progress" style={progressStyles}>
                    <div className="playing-progress" style={{
                           width: `${currentPlaybackPercent}%`,
                           display: rewindPercent !== 0 ? 'none' : 'block',
                           ...playingStyles
                       }}></div>
                    <div className="playing-progress" style={{ width: `${rewindPercent}%`, ...playingStyles }}></div>
                </div>
            </div>
        </div>
        <span style={{ display: 'inline-block', verticalAlign: 'top', marginTop: '2px' }}>{musicKit.formatMediaTime(musicKit.instance.currentPlaybackDuration)}</span>
    </div>;
};
