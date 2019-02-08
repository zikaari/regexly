import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactGA from 'react-ga'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement,
)

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_GA_ID !== '') {
  ReactGA.initialize(process.env.REACT_APP_GA_ID, {gaOptions: {
    appId: 'io.chipto.regexly',
    appName: 'Regexly',
    appVersion: process.env.REACT_APP_VERSION || '0.0.0',
  } as any})
  ReactGA.pageview(window.location.pathname)
}

registerServiceWorker()
