/*
 The MIT License (MIT)

 Copyright (c) 2014 gskinner.com, inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

class RegExLexer {
    // \ ^ $ . | ? * + ( ) [ {
    static readonly CHAR_TYPES = {
        '.': 'dot',
        '|': 'alt',
        '$': 'eof',
        '^': 'bof',
        '?': 'opt', // also: "lazy"
        '+': 'plus',
        '*': 'star',
    }

    static readonly ESC_CHARS_SPECIAL = {
        w: 'word',
        W: 'notword',
        d: 'digit',
        D: 'notdigit',
        s: 'whitespace',
        S: 'notwhitespace',
        b: 'wordboundary',
        B: 'notwordboundary',
        // u-uni, x-hex, c-ctrl, oct handled in parseEsc
    }

    static readonly UNQUANTIFIABLE = {
        quant: true,
        plus: true,
        star: true,
        opt: true,
        eof: true,
        bof: true,
        group: true, // group open
        lookaround: true, // lookaround open
        wordboundary: true,
        notwordboundary: true,
        lazy: true,
        alt: true,
        open: true,
    }

    static readonly ESC_CHAR_CODES = {
        0: 0,  // null
        t: 9,  // tab
        n: 10, // lf
        v: 11, // vertical tab
        f: 12, // form feed
        r: 13,  // cr
    }

    public static parse = (str): IToken => {
        if (str === RegExLexer.string) {
            return RegExLexer.token
        }

        RegExLexer.token = null
        RegExLexer.string = str
        RegExLexer.errors = []
        const capgroups = RegExLexer.captureGroups = []
        const groups = []
        let i = 0
        const l = str.length
        let o
        let c
        let token
        let prev = null
        let charset = null
        const unquantifiable = RegExLexer.UNQUANTIFIABLE
        const charTypes = RegExLexer.CHAR_TYPES
        const closeIndex = str.lastIndexOf('/')

        while (i < l) {
            c = str[i]

            token = { i, l: 1, prev }

            if (i === 0 || i >= closeIndex) {
                RegExLexer.parseFlag(str, token)
            } else if (c === '(' && !charset) {
                RegExLexer.parseGroup(str, token)
                token.depth = groups.length
                groups.push(token)
                if (token.capture) {
                    capgroups.push(token)
                    token.num = capgroups.length
                }
            } else if (c === ')' && !charset) {
                token.type = 'groupclose'
                if (groups.length) {
                    o = token.open = groups.pop()
                    o.close = token
                } else {
                    token.err = 'groupclose'
                }
            } else if (c === '[' && !charset) {
                token.type = token.clss = 'set'
                charset = token
                if (str[i + 1] === '^') {
                    token.l++
                    token.type += 'not'
                }
            } else if (c === ']' && charset) {
                token.type = 'setclose'
                token.open = charset
                charset.close = token
                charset = null
            } else if ((c === '+' || c === '*') && !charset) {
                token.type = charTypes[c]
                token.clss = 'quant'
                token.min = (c === '+' ? 1 : 0)
                token.max = -1
            } else if (c === '{' && !charset && str.substr(i).search(/^{\d+,?\d*}/) !== -1) {
                RegExLexer.parseQuant(str, token)
            } else if (c === '\\') {
                RegExLexer.parseEsc(str, token, charset, capgroups, closeIndex)
            } else if (c === '?' && !charset) {
                if (!prev || prev.clss !== 'quant') {
                    token.type = charTypes[c]
                    token.clss = 'quant'
                    token.min = 0
                    token.max = 1
                } else {
                    token.type = 'lazy'
                    token.related = [prev]
                }
            } else if (c === '-' && charset && prev.code != null && prev.prev && prev.prev.type !== 'range') {
                // this may be the start of a range, but we'll need to validate after the next token.
                token.type = 'range'
            } else {
                RegExLexer.parseChar(str, token, charset)
            }

            if (prev) {
                prev.next = token
            }

            // post processing:
            if (token.clss === 'quant') {
                if (!prev || unquantifiable[prev.type]) {
                    token.err = 'quanttarg'
                }
                else {
                    token.related = [prev.open || prev]
                }
            }
            if (prev && prev.type === 'range' && prev.l === 1) {
                token = RegExLexer.validateRange(str, prev)
            }
            if (token.open && !token.clss) {
                token.clss = token.open.clss
            }

            if (!RegExLexer.token) {
                RegExLexer.token = token
            }
            i = token.end = token.i + token.l
            if (token.err) {
                RegExLexer.errors.push(token.err)
            }
            prev = token
        }

        while (groups.length) {
            RegExLexer.errors.push(groups.pop().err = 'groupopen')
        }
        if (charset) {
            RegExLexer.errors.push(charset.err = 'setopen')
        }

        return RegExLexer.token
    }

    private static string = null
    private static token = null
    private static errors = null
    private static captureGroups = null

    private static parseFlag = (str, token) => {
        // note that this doesn't deal with misformed patterns or incorrect flags.
        const i = token.i
        const c = str[i]
        if (str[i] === '/') {
            token.type = (i === 0) ? 'open' : 'close'
            if (i !== 0) {
                token.related = [RegExLexer.token]
                RegExLexer.token.related = [token]
            }
        } else {
            token.type = 'flag_' + c
        }
        token.clear = true
    }

    private static parseChar = (str, token, charset?) => {
        const c = str[token.i]
        token.type = (!charset && RegExLexer.CHAR_TYPES[c]) || 'char'
        if (!charset && c === '/') {
            token.err = 'fwdslash'
        }
        if (token.type === 'char') {
            token.code = c.charCodeAt(0)
        } else if (token.type === 'bof' || token.type === 'eof') {
            token.clss = 'anchor'
        } else if (token.type === 'dot') {
            token.clss = 'charclass'
        }
        return token
    }

    private static parseGroup = (str, token) => {
        token.clss = 'group'
        const match = str.substr(token.i + 1).match(/^\?(?::|<?[!=])/)
        const s = match && match[0]
        if (s === '?:') {
            token.l = 3
            token.type = 'noncapgroup'
        } else if (s) {
            token.behind = s[1] === '<'
            token.negative = s[1 + token.behind] === '!'
            token.clss = 'lookaround'
            token.type = (token.negative ? 'neg' : 'pos') + 'look' + (token.behind ? 'behind' : 'ahead')
            token.l = s.length + 1
            if (token.behind) {
                token.err = 'lookbehind'
            } // not supported in JS
        } else {
            token.type = 'group'
            token.capture = true
        }
        return token
    }

    private static parseEsc = (str, token, charset, capgroups, closeIndex) => {
        // jsMode tries to read escape chars as a JS string which is less permissive than JS RegExp, and doesn't support \c or backreferences, used for subst

        // Note: \8 & \9 are treated differently: IE & Chrome match "8", Safari & FF match "\8", we support the former case since Chrome & IE are dominant
        // Note: Chrome does weird things with \x & \u depending on a number of factors, we ignore RegExLexer.
        const i = token.i
        const jsMode = token.js
        let match
        let o
        let sub = str.substr(i + 1)
        const c = sub[0]
        if (i + 1 === (closeIndex || str.length)) {
            token.err = 'esccharopen'
            return
        }

        // tslint:disable-next-line:no-conditional-assignment
        if (!jsMode && !charset && (match = sub.match(/^\d\d?/)) && (o = capgroups[parseInt(match[0], 10) - 1])) {
            // back reference - only if there is a matching capture group
            token.type = 'backref'
            token.related = [o]
            token.group = o
            token.l += match[0].length
            return token
        }

        // tslint:disable-next-line:no-conditional-assignment
        if (match = sub.match(/^u[\da-fA-F]{4}/)) {
            // unicode: \uFFFF
            sub = match[0].substr(1)
            token.type = 'escunicode'
            token.l += 5
            token.code = parseInt(sub, 16)
        // tslint:disable-next-line:no-conditional-assignment
        } else if (match = sub.match(/^x[\da-fA-F]{2}/)) {
            // hex ascii: \xFF
            // \x{} not supported in JS regexp
            sub = match[0].substr(1)
            token.type = 'eschexadecimal'
            token.l += 3
            token.code = parseInt(sub, 16)
        // tslint:disable-next-line:no-conditional-assignment
        } else if (!jsMode && (match = sub.match(/^c[a-zA-Z]/))) {
            // control char: \cA \cz
            // not supported in JS strings
            sub = match[0].substr(1)
            token.type = 'esccontrolchar'
            token.l += 2
            const code = sub.toUpperCase().charCodeAt(0) - 64 // A=65
            if (code > 0) {
                token.code = code
            }
        // tslint:disable-next-line:no-conditional-assignment
        } else if (match = sub.match(/^[0-7]{1,3}/)) {
            // octal ascii
            sub = match[0]
            if (parseInt(sub, 8) > 255) {
                sub = sub.substr(0, 2)
            }
            token.type = 'escoctal'
            token.l += sub.length
            token.code = parseInt(sub, 8)
        } else if (!jsMode && c === 'c') {
            // control char without a code - strangely, this is decomposed into literals equivalent to "\\c"
            return RegExLexer.parseChar(str, token, charset) // this builds the "/" token
        } else {
            // single char
            token.l++
            if (jsMode && (c === 'x' || c === 'u')) {
                token.err = 'esccharbad'
            }
            if (!jsMode) {
                token.type = RegExLexer.ESC_CHARS_SPECIAL[c]
            }

            if (token.type) {
                token.clss = (c.toLowerCase() === 'b') ? 'anchor' : 'charclass'
                return token
            }
            token.type = 'escchar'
            token.code = RegExLexer.ESC_CHAR_CODES[c]
            if (token.code == null) {
                token.code = c.charCodeAt(0)
            }
        }
        token.clss = 'esc'
        return token
    }

    private static parseQuant = (str, token) => {
        token.type = token.clss = 'quant'
        const i = token.i
        const end = str.indexOf('}', i + 1)
        token.l += end - i
        const arr = str.substring(i + 1, end).split(',')
        token.min = parseInt(arr[0], 10)
        token.max = (arr[1] == null) ? token.min : (arr[1] === '') ? -1 : parseInt(arr[1], 10)
        if (token.max !== -1 && token.min > token.max) {
            token.err = 'quantrev'
        }
        return token
    }

    private static validateRange = (str, token) => {
        const prev = token.prev
        const next = token.next
        if (prev.code == null || next.code == null) {
            // not a range, rewrite as a char:
            RegExLexer.parseChar(str, token)
        } else {
            token.clss = 'set'
            if (prev.code > next.code) {
                token.err = 'rangerev'
            }
            // preserve as separate tokens, but treat as one in the UI:
            next.proxy = prev.proxy = token
            token.set = [prev, token, next]
        }
        return next
    }
}

interface IToken {
    i: number
    l: number
    end: number
    next?: IToken
    prev: IToken
    type: TokenType
}

type TokenType = 'open' | 'dot' | 'word' | 'notword' | 'digit' | 'notdigit' | 'whitespace' | 'notwhitespace' | 'set' | 'setnot' | 'range' | 'bof' | 'eof' | 'wordboundary' | 'notwordboundary' | 'escoctal' | 'eschexadecimal' | 'escunicode' | 'esccontrolchar' | 'group' | 'backref' | 'noncapgroup' | 'poslookahead' | 'neglookahead' | 'poslookbehind' | 'neglookbehind' | 'plus' | 'star' | 'quant' | 'opt' | 'lazy' | 'alt' | 'subst_match' | 'subst_num' | 'subst_pre' | 'subst_post' | 'subst_$' | 'flag_i' | 'flag_g' | 'flag_m'

export { RegExLexer }
