import * as React from 'react'
import * as CodeMirror from "codemirror"

import 'codemirror/addon/edit/closebrackets'

import 'codemirror/lib/codemirror.css'
import './RegexInput.css'

import { RegExLexer } from './RegExLexer'
import { ExpressionHighlighter } from './ExpressionHighlighter'

interface RegexInputProps {
    onChange: (text: string) => void
    defaultValue: string
}

interface RegexInputState { }

class RegexInput extends React.PureComponent<RegexInputProps, RegexInputState> {
    private cmEditor: CodeMirror.Editor
    private highligher: ExpressionHighlighter
    constructor(props) {
        super(props)
    }
    public render(): JSX.Element {
        return (
            <textarea ref={r => this.createCmEditor(r)}></textarea>
        )
    }

    private createCmEditor(textarea: HTMLTextAreaElement) {
        if (this.cmEditor) {
            return
        }
        this.cmEditor = CodeMirror.fromTextArea(textarea, {
            autoCloseBrackets: true,
            matchBrackets: true,
            scrollbarStyle: "null"
        } as any)

        this.cmEditor.setOption("extraKeys", {
            Tab: (cm) => {
            },
            Enter(cm) { }
        });

        this.highligher = new ExpressionHighlighter(this.cmEditor)
    }

    private drawHighlights() {
        const token = RegExLexer.parse(this.cmEditor.getValue())
        this.highligher.draw(token)
    }

    componentDidMount() {
        this.cmEditor.setValue(this.props.defaultValue || '')
        this.drawHighlights()
        this.cmEditor.on('change', e => {
            const value = e.getValue()
            this.drawHighlights()
            this.props.onChange(value)
        })
    }

}

export default RegexInput
