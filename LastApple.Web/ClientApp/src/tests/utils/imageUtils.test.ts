import { getImageUrl } from '../../utils/imageUtils';

describe('imageUtils', () => {
    describe('getImageUrl', () => {
        it('replaces image dimensions correctly', () => {
            const testUrl = 'https://example.com/image/{w}x{h}.jpg';
            const result = getImageUrl(testUrl);
            expect(result).toBe('https://example.com/image/400x400.jpg');
        });

        it('handles null image url', () => {
            const result = getImageUrl(null as any);
            expect(result).toBe('default-album-cover.png');
        });

        it('handles undefined image url', () => {
            const result = getImageUrl(undefined as any);
            expect(result).toBe('default-album-cover.png');
        });

        it('replaces image dimensions correctly with different pattern', () => {
            const testUrl = 'https://music.apple.com/artwork/{w}x{h}bb.jpg';
            const result = getImageUrl(testUrl);
            expect(result).toBe('https://music.apple.com/artwork/400x400bb.jpg');
        });

        it('replaces 2000x2000 with custom size', () => {
            const testUrl = 'https://music.apple.com/artwork/2000x2000bb.jpg';
            const result = getImageUrl(testUrl, 300);
            expect(result).toBe('https://music.apple.com/artwork/300x300bb.jpg');
        });

        it('handles custom size parameter', () => {
            const testUrl = 'https://example.com/image/{w}x{h}.jpg';
            const result = getImageUrl(testUrl, 256);
            expect(result).toBe('https://example.com/image/256x256.jpg');
        });
    });
});