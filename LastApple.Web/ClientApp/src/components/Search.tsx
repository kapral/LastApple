import React, { useState, useCallback } from 'react';
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

export const Search = <TItem extends Option>({ 
    search, 
    placeholder, 
    onChanged, 
    labelAccessor, 
    elementIndex 
}: ISearchProps<TItem>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [matches, setMatches] = useState<Array<TItem>>([]);

    const handleSearch = useCallback(async (term: string) => {
        setIsLoading(true);

        try {
            const searchMatches = await search(term);
            setMatches(searchMatches);
        } finally {
            setIsLoading(false);
        }
    }, [search]);

    return <div className={`search-control-${elementIndex || 0}`}>
        <AsyncTypeahead id={'artist-search-'}
                        multiple
                        placeholder={placeholder}
                        isLoading={isLoading}
                        onSearch={handleSearch}
                        delay={500}
                        options={matches}
                        labelKey={labelAccessor}
                        onChange={items => onChanged(items as TItem[])} />
    </div>
};