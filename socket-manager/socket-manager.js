const WebSocket = require('ws').WebSocket
var url = process.env.SOCKET_SERVER_URL || ''
global.ws = null
var reconnectionCount = 1
const reconnectionInterval = () => {
  let interval = Number(process.env.RECONNECTION_INTERVAL || 30000)
  return interval
  let t = interval * reconnectionCount++
  let limit = 20 * 60 * 1000 // 20min
  if (t > limit) {
    t = limit
  }
  return t
}

let osInfo = util.osBaseInfo()
let sayac = 0
var moduleHolder = {}

module.exports = () => new Promise(async (resolve, reject) => {
  try {
    moduleHolder = await util.moduleLoader(path.join(__dirname, 'sockets'), '.socket.js')

    connectServer()

    resolve('')
  } catch (e) {
    reject(e)
  }
})


global.sendError = (err, callback) => {
  console.log(`err`, err)
  let error = { name: 'Error', message: '' }
  if (typeof err == 'string') {
    error.message = err
  } else {
    error.name = err.name || 'Error'
    if (err.message)
      error.message = err.message
    else
      error.message = err.name || ''
  }

  let obj = {
    event: 'callback',
    success: false,
    error: error,
    callback:callback || ''
  }
  console.log(`obj`, obj )
  if(global.ws.readyState === WebSocket.OPEN)
    global.ws.send(JSON.stringify(obj))
}

global.sendSuccess = (data, callback) => {

  let obj = {
    event: 'callback',
    success: true,
    data: data,
    callback:callback || ''
  }
  if(global.ws.readyState === WebSocket.OPEN)
    global.ws.send(JSON.stringify(obj))

}




function connectServer() {
  try {

    global.ws = new WebSocket(url)

    


    ws.on('open', () => {
      reconnectionCount = 1

      devLog(`Connected to `, `${process.env.SOCKET_SERVER_URL}`.brightGreen)
      if (!process.env.CLIENT_ID || !process.env.CLIENT_PASS) {
        let clientId = ''
        let clientPass = ''

        ws.send(JSON.stringify({ event: 'register', osInfo: osInfo, clientId: clientId, clientPass: clientPass }))

      } else {
        ws.send(JSON.stringify({ event: 'subscribe', clientId: process.env.CLIENT_ID, clientPass: process.env.CLIENT_PASS }))

      }

    })
    

    ws.on('message', (rawData) => {
      if (rawData) {
        try {
          let data = JSON.parse(rawData.toString())
          if (data.event && moduleHolder[data.event]) {
            moduleHolder[data.event](global.ws, data)
          }
        } catch (err) {
          let eventName = rawData.toString()
          if (eventName && moduleHolder[eventName]) {
            moduleHolder[eventName](global.ws, eventName)
          }
        }
      }
    })

    ws.on('ping', () => ws.pong())

    ws.on('error', (err) => {
      errorLog('hata', err.name, err.message)
    })

    ws.on('close', () => {
      setTimeout(() => {
        connectServer()
      }, reconnectionInterval())
    })

  } catch (err) {
    errorLog(err)
    setTimeout(() => {
      connectServer()
    }, reconnectionInterval())
  }
}
