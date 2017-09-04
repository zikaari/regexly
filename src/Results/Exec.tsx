import * as React from "react"
import { objFormat, tokenizeFnCall } from '../CodeFormatter';
import * as classNames from "classnames"

interface IExecProps {
    regex: RegExp
    str: string
}

interface IExecState { }

class Exec extends React.Component<IExecProps, IExecState> {
    public render(): JSX.Element {
        const { regex, str } = this.props
        let execRes = null, err = null
        if (regex instanceof RegExp && typeof str === 'string') {
            try {
                execRes = this.safeExec(regex, str)
            } catch (error) {
                err = error
            }
        }
        return (
            <div>
                <span className='regex-op'><a>{tokenizeFnCall('regexp.exec(string)')}</a></span>
                <div className={classNames('regex-op-res', (!Array.isArray(execRes) || execRes.length === 0) ? 'code value-type nill' : '')}>
                    {(err) ? err : (Array.isArray(execRes) && execRes.length >= 1) ? this.renderRes(execRes) : 'null'}
                </div>
            </div>
        )
    }

    safeExec(regex: RegExp, str: string) {
        let results = []
        let res = regex.exec(str)
        let indexFromLastExec = -10
        while (res && res.index !== indexFromLastExec) {
            results.push(res)
            indexFromLastExec = res.index
            res = regex.exec(str)
        }
        return results
    }

    renderRes(execRes: any) {
        if (Array.isArray(execRes)) {
            return (
                <div>
                    <span className='regex-op-exec-method'>Invoked {execRes.length} time{(execRes.length === 1)? '' : 's'} using while loop</span>
                    {execRes.map(res => {
                        if(res.input.length > 60) {
                            res.input = res.input.slice(0, 60) + '...'
                        }
                        return <div key={res.index}>{objFormat(res)}</div>
                    })}
                </div>
            )
        }
        return null
    }
}

export default Exec
