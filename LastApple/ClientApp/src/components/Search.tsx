import * as React from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import musicKit, { IMediaItemOptions } from "./MusicKitWrapper/MusicKit";

interface ISearchState {
    isLoading: boolean;
    matches: Array<IMediaItemOptions>;
}

interface ISearchProps {
    onFound: (artistId: string) => void;
}

export class Search extends React.Component<ISearchProps, ISearchState> {
    constructor(props) {
        super(props);

        this.state = {isLoading: false, matches: []};
    }

    async search(term: string) {
        this.setState({isLoading: true});
        const kit = musicKit.getInstance();

        let result = await kit.api.search(term);

        if(!result.artists) {
            this.setState({isLoading: false, matches: []});
            return;
        }

        this.setState({ isLoading: false, matches: result.artists.data.map(x => x)});
    }

    select(artist: IMediaItemOptions) {
        if(!artist) {
            return;
        }

        this.props.onFound(artist.id);
    }

    render() {
        return <div>
            <AsyncTypeahead isLoading={this.state.isLoading}
                            onSearch={query => this.search(query)}
                            delay={500}
                            options={this.state.matches}
                            labelKey={x => x.attributes.name}
                            onChange={items => this.select(items[0])}/>
        </div>
    }
}