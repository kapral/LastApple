import * as React from "react";

declare var MusicKit;

export class PlayerControl extends React.Component {
    async componentDidMount() {
        const tokenResponse = await fetch('/auth/token');

        const token = await tokenResponse.json();

        let kit = MusicKit.configure({
            app: {
                name: 'Last Apple',
                build: '0.0.1'
            },
            developerToken: token
        });
        await kit.authorize();
        await kit.setQueue({ album: '14716026' });
        await kit.play();
    }

    render() {
        return <div></div>;
    }
}