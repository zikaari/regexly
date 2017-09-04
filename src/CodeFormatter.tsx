import * as React from 'react'
import * as classNames from 'classnames'
import './CodeFormatter.css'

export const tokenizeFnCall = (code: string, jsx?: JSX.Element) => {
    const match = code.match(/(\w+)(\.\w+)(\()(\w+)(\))/)
    if (match) {
        const [_, obj, fn, openingBracket, arg, closingBracket] = match
        return (
            <span className='code  protofn-call'>
                <span className='code  obj'>{obj}</span>
                <span className='code  protofn'>{fn}</span>
                <span className='code  protofn-opening-bracket'>{openingBracket}</span>
                <span className='code  protofn-arg'>{arg}</span>
                <span className='code  protofn-closing-bracket'>{closingBracket}</span>
            </span>
        )
    }
    return null
}

export const tokenizeDeclaration = (code: string) => {
    const match = code.match(/(\w+)\s+(\w+)\s(=)/)
    if (match) {
        const [_, type, identifier, assignmentOperator] = match
        return (
            <span className='code  var-declartion'>
                <span className='code  var-type'>{type}</span>
                <span className='code  var-identifier'>{identifier}</span>
                <span className='code  assignment-operator'>{assignmentOperator}</span>
            </span>
        )
    }
    return null
}

export const objFormat = (obj: any) => {
    let isNodeArray = (Array.isArray(obj))
    let nodes = []
    for (let key in obj) {
        let value = obj[key]
        nodes.push(
            <li className='code key-value' key={key + value}>
                <span>{key}</span>
                <span>:</span>
                <span data-value-type={(value === null || value === 'null' || typeof value === 'undefined') ? 'nill' : typeof value}>{
                    (value === null) ? 'null' :
                        (typeof value === 'undefined') ? 'undefined' :
                            (typeof value === 'object') ? objFormat(value) : value}
                </span>
            </li>
        )
    }
    return (
        <ul className={classNames('value-type', (isNodeArray) ? 'array' : '')}>
            {nodes}
        </ul>
    )
} 