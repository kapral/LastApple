export const getImageUrl = (sourceUrl: string, size: number = 400): string => {
    return sourceUrl
        ? sourceUrl.replace('{w}x{h}', `${size}x${size}`).replace('2000x2000', `${size}x${size}`)
        : 'default-album-cover.png';
};
