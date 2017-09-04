import * as React from "react"
import { tokenizeFnCall, objFormat } from '../CodeFormatter'
import * as classNames from "classnames"

interface ISearchProps {
    regex: RegExp
    str: string
}

interface ISearchState { }

class Search extends React.Component<ISearchProps, ISearchState> {
    public render(): JSX.Element {
        const { regex, str } = this.props
        let searchRes = null, err = null
        if (regex instanceof RegExp && typeof str === 'string') {
            try {
                searchRes = str.search(regex)
            } catch (error) {
                err = error
            }
        }
        return (
            <div>
                <span className='regex-op'><a>{tokenizeFnCall('string.search(regexp)')}</a></span>
                <div className='regex-op-res code value-type number'>
                    {(err) ? err : searchRes}
                </div>
            </div>
        )
    }
}

export default Search
