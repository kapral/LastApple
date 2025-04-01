import * as React from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { Option, LabelKey } from 'react-bootstrap-typeahead/types/types';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface ISearchState<TItem extends Option> {
    isLoading: boolean;
    matches: Array<TItem>;
}

interface ISearchProps<TItem extends Option> {
    search: (term: string) => Promise<TItem[]>,
    placeholder: string,
    onChanged: (items: TItem[]) => void;
    labelAccessor?: LabelKey;
    elementIndex?: number;
}

export class Search<TItem extends Option> extends React.Component<ISearchProps<TItem>, ISearchState<TItem>> {
    constructor(props) {
        super(props);

        this.state = {isLoading: false, matches: []};
    }

    async search(term: string) {
        this.setState({ isLoading: true, matches: this.state.matches });

        const matches = await this.props.search(term);

        this.setState({ isLoading: false, matches });
    }

    render() {
        return <div className={`search-control-${this.props.elementIndex || 0}`}>
            <AsyncTypeahead id={'artist-search-'}
                            multiple
                            placeholder={this.props.placeholder}
                            isLoading={this.state.isLoading}
                            onSearch={query => this.search(query)}
                            delay={500}
                            options={this.state.matches}
                            labelKey={this.props.labelAccessor}
                            onChange={items => this.props.onChanged(items as TItem[])} />
        </div>
    }
}