import Search from './Search';
import * as React from 'react';
import './index.css';

import Test from './Test'
import Match from './Match'
import Exec from './Exec'
// import Replace from './Replace'

interface IResultsProps {
    regex: RegExp
    str: string
}

interface IResultsState { }

class Results extends React.Component<IResultsProps, IResultsState> {
    public render(): JSX.Element {
        const { regex, str } = this.props
        return (
            <div className='regex-op-results'>
                <Test regex={regex} str={str} />
                <Search regex={regex} str={str} />
                <Match regex={regex} str={str} />
                <Exec regex={regex} str={str} />
                {/*<Replace regex={regex} str={str} />*/}
            </div>
        )
    }
}

export default Results
