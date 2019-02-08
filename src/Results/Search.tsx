import * as React from 'react'
import { objFormat, tokenizeFnCall } from '../CodeFormatter'

interface ISearchProps {
    regex: RegExp
    str: string
}

class Search extends React.Component<ISearchProps> {
    public render(): JSX.Element {
        const { regex, str } = this.props
        let searchRes = null
        let err = null
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
