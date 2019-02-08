import * as CodeMirror from 'codemirror'
import * as React from 'react'
import { ExpressionHighlighter } from './ExpressionHighlighter'
import { RegExLexer } from './RegExLexer'

import 'codemirror/addon/edit/closebrackets'

import 'codemirror/lib/codemirror.css'
import './RegexInput.css'

interface IRegexInputProps {
    onChange: (text: string) => void
    defaultValue: string
}

class RegexInput extends React.PureComponent<IRegexInputProps> {
    private cmEditor: CodeMirror.Editor
    private highligher: ExpressionHighlighter
    constructor(props) {
        super(props)
    }
    public render(): JSX.Element {
        return (
            <textarea ref={r => this.createCmEditor(r)} />
        )
    }

    public componentDidMount() {
        this.cmEditor.setValue(this.props.defaultValue || '')
        this.drawHighlights()
        this.cmEditor.on('change', e => {
            const value = e.getValue()
            this.drawHighlights()
            this.props.onChange(value)
        })
    }

    private createCmEditor(textarea: HTMLTextAreaElement) {
        if (this.cmEditor) {
            return
        }
        this.cmEditor = CodeMirror.fromTextArea(textarea, {
            autoCloseBrackets: true,
            matchBrackets: true,
            scrollbarStyle: 'null',
        } as any)

        this.cmEditor.setOption('extraKeys', {
            Tab: (cm) => {
            },
            Enter(cm) { },
        })

        this.highligher = new ExpressionHighlighter(this.cmEditor)
    }

    private drawHighlights() {
        const token = RegExLexer.parse(this.cmEditor.getValue())
        this.highligher.draw(token)
    }

}

export default RegexInput
