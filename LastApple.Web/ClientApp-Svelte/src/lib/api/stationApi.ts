// Station API client
// Placeholder - will be implemented in Phase 4

export interface IStationDefinition {
    stationType: string;
}

export interface IStation {
    id: string;
    songIds: string[];
    isContinuous: boolean;
    isGroupedByAlbum: boolean;
    size: number;
    definition: IStationDefinition;
}

const stationApi = {
    async getStation(stationId: string): Promise<IStation> {
        // Placeholder - will call /api/station/{id}
        throw new Error('Not implemented');
    },

    async topUp(stationId: string, stationType: string, count: number): Promise<void> {
        // Placeholder - will call /api/station/{id}/top-up
    },

    async deleteSongs(stationId: string, position: number, count: number): Promise<void> {
        // Placeholder - will call DELETE /api/station/{id}/songs
    },

    async createStation(definition: IStationDefinition): Promise<IStation> {
        // Placeholder - will call POST /api/station
        throw new Error('Not implemented');
    }
};

export default stationApi;
