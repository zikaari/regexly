import * as classNames from 'classnames'
import * as React from 'react'
import { objFormat, tokenizeFnCall } from '../CodeFormatter'

interface IMatchProps {
    regex: RegExp
    str: string
}

class Match extends React.Component<IMatchProps> {
    public render(): JSX.Element {
        const { regex, str } = this.props
        let matchRes = null
        let err = null
        if (regex instanceof RegExp && typeof str === 'string') {
            try {
                matchRes = str.match(regex)
            } catch (error) {
                err = error
            }
        }
        return (
            <div>
                <span className='regex-op'><a>{tokenizeFnCall('string.match(regexp)')}</a></span>
                <div className={classNames('regex-op-res', (matchRes === null) ? 'code value-type nill' : '')}>
                    {(err) ? 'err' : (matchRes) ? objFormat(matchRes) : 'null'}
                </div>
            </div>
        )
    }
}

export default Match
