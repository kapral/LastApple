import { IMusicKit } from "./components/MusicKitWrapper/MusicKitDefinitions";
import appleMusicApi from "./restClients/AppleMusicApi";
import environment from './Environment';

class MusicKit {
    instance: IMusicKit;
    instancePromise: Promise<IMusicKit>;
    private musicKit = (window as any).MusicKit;

    async getInstance() {
        if(this.instancePromise)
            return await this.instancePromise;
        
        let resolve = null;
        this.instancePromise = new Promise<IMusicKit>(r => resolve = r);
        
        const token = await appleMusicApi.getDeveloperToken();

        const musicKit = this.musicKit.configure({
            app: {
                name: 'Lastream',
                build: '1.0.0',
                icon: `${environment.websiteUrl}/logo.png}`
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

export default new MusicKit();