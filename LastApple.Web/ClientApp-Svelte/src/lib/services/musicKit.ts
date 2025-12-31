// MusicKit service
import { browser } from '$app/environment';

class MusicKitService {
    instance: MusicKit.MusicKitInstance | null = null;
    instancePromise: Promise<MusicKit.MusicKitInstance> | null = null;

    async getInstance(): Promise<MusicKit.MusicKitInstance> {
        if (!browser) {
            throw new Error('MusicKit can only be used in browser');
        }

        if (this.instancePromise) {
            return await this.instancePromise;
        }

        let resolve: (value: MusicKit.MusicKitInstance) => void;
        this.instancePromise = new Promise<MusicKit.MusicKitInstance>(r => resolve = r);

        // Dynamic import to avoid SSR issues
        const { default: appleMusicApi } = await import('$lib/api/appleMusicApi');
        const token = await appleMusicApi.getDeveloperToken();

        const musicKit = (window as any).MusicKit;
        const instance = await musicKit.configure({
            app: {
                name: 'Lastream',
                build: '1.0.0',
                icon: '/logo.png'
            },
            developerToken: token
        });

        this.instance = instance;
        resolve!(instance);

        return this.instance;
    }

    formatMediaTime(seconds: number): string {
        if (!browser) return '0:00';
        const musicKit = (window as any).MusicKit;
        return musicKit.formatMediaTime(Number.isFinite(seconds) ? seconds : 0);
    }
}

const musicKit = new MusicKitService();

export default musicKit;
