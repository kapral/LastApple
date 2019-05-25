import * as React from 'react';
import { AsyncTypeahead, TypeaheadLabelKey, TypeaheadModel } from 'react-bootstrap-typeahead';

interface ISearchState<TItem extends TypeaheadModel> {
    isLoading: boolean;
    matches: Array<TItem>;
}

interface ISearchProps<TItem extends TypeaheadModel> {
    search: (term: string) => Promise<TItem[]>,
    placeholder: string,
    onChanged: (item: TItem) => void;
    labelAccessor?: TypeaheadLabelKey<TItem>;
    elementIndex?: number;
}

export class Search<TItem extends TypeaheadModel> extends React.Component<ISearchProps<TItem>, ISearchState<TItem>> {
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
                            placeholder={this.props.placeholder}
                            isLoading={this.state.isLoading}
                            onSearch={query => this.search(query)}
                            delay={500}
                            options={this.state.matches}
                            labelKey={this.props.labelAccessor}
                            onChange={items => this.props.onChanged(items[0])} />
        </div>
    }
}