import { homeRoute, settingsRoute, stationRoute } from '../routes';

describe('Routes', () => {
  it('exports correct route paths', () => {
    expect(homeRoute).toBe('/');
    expect(settingsRoute).toBe('/settings');
    expect(stationRoute).toBe('/station/:stationId');
  });
});