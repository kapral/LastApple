import React, { useState, useEffect } from "react";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";

export const Tag: React.FC<IStationParams> = ({ triggerCreate, onStationCreated, onOptionsChanged }) => {
    const [tagName, setTagName] = useState<string | null>(null);

    useEffect(() => {
        const createStation = async () => {
            if (triggerCreate) {
                const station = await stationApi.postStation('tags', tagName);
                onStationCreated(station.id);
            }
        };

        createStation();
    }, [triggerCreate, tagName, onStationCreated]);

    const handleChanged = (tag: string) => {
        setTagName(tag);
        onOptionsChanged(!!tag);
    };

    return <div className={'station-parameters'}>
        <input style={{ width: '100%', padding: '6px 12px', borderWidth: '1px' }}
               placeholder={'Rock...'}
               type={'text'}
               onChange={e => handleChanged(e.currentTarget.value)}/>
    </div>
};

Tag.Definition = {
    title: 'Tag',
    description: 'A station consisting of tracks related to a last.fm tag.',
    type: Tag
};