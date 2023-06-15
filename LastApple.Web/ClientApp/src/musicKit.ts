import appleMusicApi from "./restClients/AppleMusicApi";
import environment from './Environment';
import 'musickit-js';
import MusicKitInstance = MusicKit.MusicKitInstance;

class MusicKitObj {
    instance: MusicKitInstance;
    instancePromise: Promise<MusicKitInstance>;
    private musicKit = (window as any).MusicKit;

    async getInstance() {
        if(this.instancePromise)
            return await this.instancePromise;

        let resolve = null;
        this.instancePromise = new Promise<MusicKitInstance>(r => resolve = r);

        const token = await appleMusicApi.getDeveloperToken();

        const musicKit = await this.musicKit.configure({
            app: {
                name: 'Lastream',
                build: '1.0.0',
                icon: `${environment.websiteUrl}/logo.png`
            },
            developerToken: token
        });

        this.instance = musicKit;
        resolve(musicKit);

        return await this.instancePromise;
    }

    formatMediaTime(seconds: number):string {
        return this.musicKit.formatMediaTime(Number.isFinite(seconds) ? seconds : 0);
    }
}

export default new MusicKitObj();