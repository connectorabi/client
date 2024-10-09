module.exports = () => new Promise((resolve, reject) => {
  try {
    require('colors')
    require('dotenv').config()

    global.envSave = require('env-save')


    global.fs = require('fs')
    global.path = require('path')
    global.uuid = require('uuid')
    // global.atob = require('atob')
    // global.btoa = require('btoa')
    global.util = require(path.join(__root, 'lib', 'util'))
    global.si = require('systeminformation')


    global.os = require('os')

    if (!fs.existsSync(path.join(__root, '.env'))) {
      let s = `
NODE_ENV = production
SOCKET_SERVER_URL = wss://kernel.connectorabi.com/
RECONNECTION_INTERVAL = 20000
CLIENT_ID =
CLIENT_PASS =

# Connector Client, powered by AliAbi.org
`
      fs.writeFileSync(path.join(__root, '.env'), s, 'utf8')
      // envSave('NODE_ENV','production')
      // envSave('SOCKET_SERVER_URL','wss://api.connectorjs.com/connector')
      // envSave('RECONNECTION_INTERVAL',20000)
      // envSave('CLIENT_ID','')
      // envSave('CLIENT_PASS','')
    }

    util.showAppInfo()
    resolve()
  } catch (err) {
    reject(err)
  }
})