import * as React from 'react'
import './App.css'

import { tokenizeDeclaration } from './CodeFormatter'
import RegexInput from './RegexInput'
import Results from './Results'
import StringInput from './StringInput'

import { version } from '../package.json'

interface IAppState {
  regex: RegExp
  str: string
}
class App extends React.Component<{}, IAppState> {
  constructor(props) {
    super(props)
    const { regex = /(https?)/g, str = 'https://github.com/' } = this.parseURI()
    setTimeout(() => {
      this.clearPermanlink()
    }, 1000)
    this.state = {
      regex,
      str,
    }
  }
  render() {
    const { regex, str } = this.state
    return (
      <div className='wrapper'>
        <main>
          <div>
            <div className='input-fields'>
              <label className='regex-input'>{tokenizeDeclaration('const regexp = ')}<RegexInput defaultValue={regex && regex.toString()} onChange={this.handleRegexInputOnChange} /></label>
              <label className='str-input'>{tokenizeDeclaration('const string = ')}<StringInput regex={regex} defaultValue={str} onChange={this.handleStringInputOnChange} /></label>
            </div>
            <div className='buttons'><button onClick={this.generatePermalink}>Generate permalink</button></div>
            <Results regex={regex} str={str} />
          </div>
        </main>
        <footer>
          <span>MIT License | v{version}</span>
          <a href='https://github.com/chipto/regexly' target='_blank'>Github Repository</a>
        </footer>
      </div>
    )
  }

  handleRegexInputOnChange = (text: string) => {
    this.setState({
      regex: this.constructRegExp(text),
    })
  }

  constructRegExp(rawStr: string): RegExp | null {
    let regex = null
    if (typeof rawStr === 'string') {
      const regexFirstSlashIndex = rawStr.indexOf('/')
      const regexLastSlashIndex = rawStr.lastIndexOf('/')
      let flags = ''
      if ((rawStr.length - regexLastSlashIndex) > 6 || regexFirstSlashIndex !== 0) {
        return null
      }
      flags = rawStr.substr(regexLastSlashIndex + 1)
      if (/[^gmiuy]/.test(flags)) {
        return null
      }
      const regexstr = rawStr.substr(regexFirstSlashIndex + 1, regexLastSlashIndex - 1)
      try {
        regex = RegExp(regexstr, flags)
      } catch (error) {

      }
      if (regex !== null && regex.toString() !== rawStr) {
        return null
      }
    }
    return regex
  }

  handleStringInputOnChange = (value: string) => {
    if (typeof value === 'string') {
      this.setState({
        str: value,
      })
    }
  }

  private parseURI = () => {
    const match = window.location.search.match(/(\w+)=[^&]+/g)
    let regex
    let str
    if (Array.isArray(match)) {
      match.forEach(pair => {
        const [key, value] = pair.split('=')
        if (key === 'regexp') {
          const rawStr = decodeURI(value)
          regex = this.constructRegExp(rawStr)
        }
        if (key === 'string') {
          str = decodeURI(value)
        }
      })
    }
    return { regex, str }
  }
  private clearPermanlink() {
    history.replaceState({}, '', '/')
  }
  private generatePermalink = () => {
    const { regex, str } = this.state
    if (!(regex instanceof RegExp) || typeof str !== 'string') {
      return
    }
    history.replaceState({}, '', `/?regexp=${encodeURI(this.state.regex.toString())}&string=${encodeURI(this.state.str)}`)
  }
}

export default App
