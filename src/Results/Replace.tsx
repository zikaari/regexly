import * as React from 'react'

interface IReplaceProps {
    regex: RegExp
    str: string
}

interface IReplaceState {
    replacer: string
}

class Replace extends React.Component<IReplaceProps, IReplaceState> {
    constructor(props) {
        super(props)
        this.state = {
            replacer: '',
        }
    }
    public render(): JSX.Element {
        const { regex, str } = this.props
        let replaceRes = null
        let err = null
        if (regex instanceof RegExp && typeof str === 'string') {
            try {
                replaceRes = str.replace(regex, this.state.replacer)
            } catch (error) {
                err = error
            }
        }
        return (
            <div>
                <span className='regex-op'>
                    <span className='code  protofn-call'>
                        <span className='code  obj'>string</span>
                        <span className='code  protofn'>.replace</span>
                        <span className='code  protofn-opening-bracket'>(</span>
                        <span className='code  protofn-arg'>regex</span>
                        <span className='code  protofn-arg-comma'>, </span>
                        <input type='text' onChange={this.handleInputOnChange} />
                        <span className='code  protofn-closing-bracket'>)</span>
                    </span>
                </span>
                <div className='regex-op-res code value-type string'>
                    {(err) ? 'err' : (replaceRes) ? replaceRes : ''}
                </div>
            </div>
        )
    }

    handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { currentTarget } = e
        this.setState({
            replacer: currentTarget.value,
        })
    }
}

export default Replace
