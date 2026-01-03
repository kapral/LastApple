import appleMusicApi from "$lib/api/appleMusicApi";

class MusicKitService {
    instance: MusicKit.MusicKitInstance | null = null;
    instancePromise: Promise<MusicKit.MusicKitInstance> | null = null;
    private musicKit = (window as any).MusicKit;

    async getInstance(): Promise<MusicKit.MusicKitInstance> {
        if (this.instancePromise) {
            return await this.instancePromise;
        }

        let resolve: (value: MusicKit.MusicKitInstance) => void;
        this.instancePromise = new Promise<MusicKit.MusicKitInstance>(r => resolve = r);

        const token = await appleMusicApi.getDeveloperToken();

        console.log(logo);

        const instance = await this.musicKit.configure({
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

    getExistingInstance(): MusicKit.MusicKitInstance {
        if (!musicKit.instance) {
            throw new Error('MusicKit not initialized. Call getInstance() first.');
        }
        return musicKit.instance;
    }

    formatMediaTime(seconds: number):string {
        return this.musicKit.formatMediaTime(Number.isFinite(seconds) ? seconds : 0);
    }
}

const musicKit = new MusicKitService();

export default musicKit;
