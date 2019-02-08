import * as React from 'react'
import Exec from './Exec'
import Match from './Match'
import Search from './Search'
import Test from './Test'
// import Replace from './Replace'

import './index.css'

interface IResultsProps {
    regex: RegExp
    str: string
}

class Results extends React.Component<IResultsProps> {
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
