import { IMusicKit } from "./components/MusicKitWrapper/MusicKitDefinitions";
import appleMusicApi from "./restClients/AppleMusicApi";

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
                name: 'Last Apple',
                build: '0.0.1'
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