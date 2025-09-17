import React, { useState } from 'react';
import { IStationDefinition } from './IStationDefinition';
import { Redirect } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { IStationParams } from './IStationParams';

interface DescriptorProps {
    definition: IStationDefinition;
    StationComponent: React.ComponentType<IStationParams>;
}

const descriptorStyles: React.CSSProperties = {
    margin: '5px',
    padding: '15px',
    background: '#00000099',
    cursor: 'pointer',
    flex: 1
};
const descriptorTitleStyles: React.CSSProperties = {
    marginTop: '10px',
    fontSize: '15px',
    textAlign: 'center',
    color: '#EEE'
};

export const StationDescriptor: React.FC<DescriptorProps> = ({ definition, StationComponent }) => {
    const [isValid, setIsValid] = useState(false);
    const [triggerStationCreate, setTriggerStationCreate] = useState(false);
    const [createdStationId, setCreatedStationId] = useState<string | null>(null);

    if (createdStationId) {
        return <Redirect to={`/station/${createdStationId}`}/>
    }

    const handleStationCreate = () => {
        if (!isValid)
            return;

        setTriggerStationCreate(true);
    };

    const handleOptionsChanged = (isValidOption: boolean) => {
        if (isValid !== isValidOption) {
            setIsValid(isValidOption);
        }
    };

    return <div className={'station-descriptor'} style={descriptorStyles}>
        <h4 style={descriptorTitleStyles}>{definition.title}</h4>
            <div style={{ color: '#AAA' }}>{definition.description}</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <StationComponent
                    triggerCreate={triggerStationCreate}
                    onStationCreated={id => setCreatedStationId(id)}
                    onOptionsChanged={x => handleOptionsChanged(x)} />
                <span onClick={() => handleStationCreate()}>
                    <FontAwesomeIcon style={{ color: isValid ? '#8e0000' : '#333' }} icon={faArrowCircleRight} size='2x' />
                </span>
            </div>
        </div>;
};