import { IMusicKit } from "./components/MusicKitWrapper/MusicKitDefinitions";

class MusicKit {
    private instance: IMusicKit;
    private musicKit = (window as any).MusicKit;

    async getInstance() {
        if(this.instance)
            return this.instance;

        const tokenResponse = await fetch('api/apple/auth/token');

        const token = await tokenResponse.json();

        this.instance = this.musicKit.configure({
            app: {
                name: 'Last Apple',
                build: '0.0.1'
            },
            developerToken: token
        });

        return this.instance;
    }

    formatMediaTime(seconds: number):string {
        return this.musicKit.formatMediaTime(Number.isFinite(seconds) ? seconds : 0);
    }
}

export default new MusicKit();