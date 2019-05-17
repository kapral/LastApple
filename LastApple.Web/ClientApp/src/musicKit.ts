import { IMusicKit } from "./components/MusicKitWrapper/MusicKitDefinitions";

class MusicKit {
    private instance: IMusicKit;

    async getInstance() {
        if(this.instance)
            return this.instance;

        const tokenResponse = await fetch('api/apple/auth/token');

        const token = await tokenResponse.json();

        const musicKit = (<any>window).MusicKit;

        this.instance = musicKit.configure({
            app: {
                name: 'Last Apple',
                build: '0.0.1'
            },
            developerToken: token
        });

        return this.instance;
    }
}

export default new MusicKit();