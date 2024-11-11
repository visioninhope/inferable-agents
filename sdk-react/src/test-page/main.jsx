import React from 'react'
import ReactDOM from 'react-dom/client'
import { TestPage } from './TestPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <TestPage
    baseUrl='http://localhost:4000'
    initialPrompt='What tools do we have?'
    clusterId='01JBECY8T5PT20XTTQMP2XVEE4'
    configId='01JCA0YK4YP95A9J0A34XWH50V'
    apiSecret='sk_yTEPGri7UDLaTLsDoyX4Rpqkq476KS7ZejCpPMpeYM'/>
)
