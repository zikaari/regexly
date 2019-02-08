import * as CodeMirror from 'codemirror'
import * as React from 'react'

import './StringInput.css'

interface IStringInputProps {
    defaultValue: string
    regex: RegExp
    onChange: (value: string) => void
}

class StringInput extends React.Component<IStringInputProps> {
    private activeRegex: any
    private cmEditor: CodeMirror.Editor
    private textarea: HTMLTextAreaElement
    private activeHighlighMarkers: CodeMirror.TextMarker[]
    public render(): JSX.Element {
        const { defaultValue, onChange } = this.props
        return <textarea ref={r => this.textarea = r} defaultValue={defaultValue} spellCheck={false} />
    }

    public componentWillUnmount() {
        const wrapper = this.cmEditor.getWrapperElement()
        wrapper.parentElement.removeChild(wrapper)
        this.cmEditor.off('change', this.cmOnChangeHandler)
        this.cmEditor = null
    }

    public componentDidMount() {
        this.cmEditor = CodeMirror.fromTextArea(this.textarea, {
            value: this.props.defaultValue || '',
            lineWrapping: true,
        })
        this.activeRegex = this.props.regex
        this.update()
        this.cmEditor.on('change', this.cmOnChangeHandler)
    }

    public componentWillReceiveProps(nextProps: IStringInputProps) {
        this.activeRegex = nextProps.regex
        this.update()
    }

    private cmOnChangeHandler = () => {
        this.update()
        const { onChange } = this.props
        if (typeof onChange === 'function') {
            onChange(this.cmEditor.getValue())
        }
    }

    private update = () => {
        if (Array.isArray(this.activeHighlighMarkers)) {
            this.activeHighlighMarkers.forEach(marker => marker.clear())
        }
        this.activeHighlighMarkers = []
        this.cmEditor.operation(() => {
            const doc = this.cmEditor.getDoc()
            const regexCp = new RegExp(this.activeRegex)
            const str = doc.getValue()
            let res = regexCp.exec(str)
            let indexFromLastExec = -10
            while (res && res.index !== indexFromLastExec) {
                const startPos = this.indexToCmPos(str, res.index)
                const endPos = this.indexToCmPos(str, (res.index + res[0].length))
                this.activeHighlighMarkers.push(doc.markText(startPos, endPos, { className: 're-str-match' }))
                indexFromLastExec = res.index
                res = regexCp.exec(str)
            }
        })
    }

    private handleStringInputOnChange = (e) => {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(this.textarea.value)
        }
    }

    private indexToCmPos(str: string, index: number): CodeMirror.Position {
        if (index > str.length) {
            throw new RangeError('Index out of range')
        }
        let lineNumber = 0
        let colNumber = 0
        const lines = str.split(/\n/)
        let steppedCharCount = 0
        while (lineNumber < lines.length) {
            const line = lines[lineNumber]
            const charCount = line.length + (lineNumber < lines.length ? 1 : 0) // New line char \n
            if ((steppedCharCount + charCount) > index) {
                colNumber = index - steppedCharCount
                break
            }
            steppedCharCount += charCount
            lineNumber++
        }
        return new CodeMirror.Pos(lineNumber, colNumber)
    }
}

export default StringInput
