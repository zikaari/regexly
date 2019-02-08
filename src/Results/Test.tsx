import * as React from 'react'
import { tokenizeFnCall } from '../CodeFormatter'

interface ITestProps {
    regex: RegExp
    str: string
}

class Test extends React.Component<ITestProps> {
    public render(): JSX.Element {
        const { regex, str } = this.props
        let testRes = null
        let err = null
        if (regex instanceof RegExp && typeof str === 'string') {
            try {
                testRes = regex.test(str)
            } catch (error) {
                err = error
            }
        }
        return (
            <div>
                <span className='regex-op'><a>{tokenizeFnCall('regexp.test(string)')}</a></span>
                <div className='regex-op-res code value-type boolean'>
                    {(err) ? err : (testRes) ? 'true' : 'false'}
                </div>
            </div>
        )
    }
}

export default Test
