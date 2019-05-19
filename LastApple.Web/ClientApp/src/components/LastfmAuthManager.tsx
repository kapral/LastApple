import {Component} from "react";
import React from "react";
import { Link } from "react-router-dom";

interface Image {
    size: string;
    url: string;
}

interface LastfmUser {
    name: string;
    url: string;
    image: Array<Image>
}

export class LastfmAuthManager extends Component<{}, { pending: boolean, user: LastfmUser }> {
    constructor(props) {
        super(props);

        this.state = { pending: true, user: null };
    }

    async componentDidMount() {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');


        if (token) {
            await fetch(`api/lastfm/auth?token=${token}`, {method: 'POST'});
            document.location.search = '';
        }

        const userResponse = await fetch('api/lastfm/auth/user');
        const user = await userResponse.json();

        this.setState({ pending: false, user });
    }

    async authenticate() {
        const authUrlResponse = await fetch(`api/lastfm/auth?redirectUrl=${window.location.href}`);

        window.location.href = await authUrlResponse.json();
    }

    render(): React.ReactNode {
        if(this.state.pending)
            return null;

        if (this.state.user)
            return <div>
                <a style={{
                    color: '#DDD',
                    padding: '10px',
                    textDecoration: 'none',
                    fontSize: '18px'
                }} href={this.state.user.url}
                   title={'Open lastfm profile'}
                   target="_blank">
                    {this.state.user.name}
                    <img style={{ borderRadius: '20px', marginLeft: '10px', height: '28px' }} src={this.state.user.image[0].url} />
                </a>
            </div>


        return <div>
            <a style={{
                color: '#DDD',
                padding: '10px',
                textDecoration: 'none'
            }}
               onClick={() => this.authenticate()}>Connect your last.fm account</a>
        </div>
    }
}