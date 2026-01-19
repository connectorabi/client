const WebSocket = require('ws').WebSocket
var url = process.env.SOCKET_SERVER_URL || ''
global.ws = null
var reconnectionCount = 0
var heartbeatTimer = null
var heartbeatTimeout = null
var isReconnecting = false
const HEARTBEAT_INTERVAL = 30000 // 30 saniye
const HEARTBEAT_TIMEOUT = 60000 // 60 saniye
const MAX_RECONNECTION_COUNT = 10

const reconnectionInterval = () => {
  let interval = Number(process.env.RECONNECTION_INTERVAL || 30000)
  // Exponential backoff: Her denemede interval artacak
  let backoff = Math.min(interval * Math.pow(1.5, reconnectionCount), 300000) // Max 5 dakika
  return backoff
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
  try {
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
      callback: callback || ''
    }
    console.log(`obj`, obj)

    if (!global.ws || global.ws.readyState !== WebSocket.OPEN) {
      errorLog('WebSocket is not open, cannot send error response')
      // WebSocket bağlantısı kopmuş, reconnection tetikle
      if (!isReconnecting) {
        reconnectNow()
      }
      return
    }

    global.ws.send(JSON.stringify(obj))
  } catch (error) {
    errorLog('sendError failed:', error)
    // JSON.stringify veya send hatası, reconnection tetikle
    if (!isReconnecting) {
      reconnectNow()
    }
  }
}

global.sendSuccess = (data, callback) => {
  try {
    let obj = {
      event: 'callback',
      success: true,
      data: data,
      callback: callback || ''
    }

    if (!global.ws || global.ws.readyState !== WebSocket.OPEN) {
      errorLog('WebSocket is not open, cannot send success response')
      // WebSocket bağlantısı kopmuş, reconnection tetikle
      if (!isReconnecting) {
        reconnectNow()
      }
      return
    }

    global.ws.send(JSON.stringify(obj))
  } catch (error) {
    errorLog('sendSuccess failed:', error)
    // JSON.stringify veya send hatası, reconnection tetikle
    if (!isReconnecting) {
      reconnectNow()
    }
  }
}

// Heartbeat başlat - Client'tan sunucuya periyodik ping gönder
function startHeartbeat() {
  stopHeartbeat() // Önce mevcut timer'ları temizle

  heartbeatTimer = setInterval(() => {
    if (global.ws && global.ws.readyState === WebSocket.OPEN) {
      try {
        global.ws.ping()
        devLog('Heartbeat ping sent')

        // Pong bekleme timer'ı başlat
        heartbeatTimeout = setTimeout(() => {
          errorLog('Heartbeat timeout - no pong received, reconnecting...')
          reconnectNow()
        }, HEARTBEAT_TIMEOUT)
      } catch (error) {
        errorLog('Heartbeat ping failed:', error)
        reconnectNow()
      }
    }
  }, HEARTBEAT_INTERVAL)
}

// Heartbeat durdur
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  if (heartbeatTimeout) {
    clearTimeout(heartbeatTimeout)
    heartbeatTimeout = null
  }
}

// Hemen reconnect et
function reconnectNow() {
  if (isReconnecting) return

  errorLog('Forcing reconnection...')
  stopHeartbeat()

  if (global.ws) {
    try {
      global.ws.terminate() // Eski connection'ı zorla kapat
    } catch (e) {
      // Ignore
    }
  }

  isReconnecting = true
  setTimeout(() => {
    connectServer()
  }, 1000)
}

function connectServer() {
  try {
    // Reconnection limiti kontrolü
    if (reconnectionCount >= MAX_RECONNECTION_COUNT) {
      errorLog(`Max reconnection attempts (${MAX_RECONNECTION_COUNT}) reached. Waiting longer...`)
      reconnectionCount = 0 // Reset et
    }

    // Eski WebSocket instance'ını temizle
    if (global.ws) {
      try {
        global.ws.removeAllListeners() // Tüm event listener'ları kaldır
        if (global.ws.readyState === WebSocket.OPEN || global.ws.readyState === WebSocket.CONNECTING) {
          global.ws.terminate()
        }
      } catch (e) {
        errorLog('Error cleaning up old WebSocket:', e)
      }
    }

    stopHeartbeat() // Eski heartbeat timer'larını temizle

    global.ws = new WebSocket(url)

    ws.on('open', () => {
      reconnectionCount = 0 // Başarılı bağlantıda reset
      isReconnecting = false

      devLog(`Connected to `, `${process.env.SOCKET_SERVER_URL}`.brightGreen)

      // Heartbeat başlat
      startHeartbeat()

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
            try {
              // Socket handler çağrısını try-catch içine al
              moduleHolder[data.event](global.ws, data)
            } catch (handlerError) {
              errorLog('Socket handler error:', handlerError)
              // Handler'da hata oluştu, client'a error callback gönder
              if (data.callback) {
                sendError(handlerError, data.callback)
              }
            }
          }
        } catch (err) {
          errorLog('Message parse error:', err)
          try {
            let eventName = rawData.toString()
            if (eventName && moduleHolder[eventName]) {
              try {
                moduleHolder[eventName](global.ws, eventName)
              } catch (handlerError) {
                errorLog('Socket handler error:', handlerError)
              }
            }
          } catch (e) {
            errorLog('Message processing failed:', e)
          }
        }
      }
    })

    ws.on('ping', () => {
      try {
        ws.pong()
        devLog('pong gonderildi')
      } catch (error) {
        errorLog('Pong send error:', error)
      }
    })
    ws.on('pong', () => {
      // Sunucudan pong alındı, heartbeat timeout'u temizle
      if (heartbeatTimeout) {
        clearTimeout(heartbeatTimeout)
        heartbeatTimeout = null
      }
      devLog('Pong received from server')
    })

    ws.on('error', (err) => {
      errorLog('WebSocket error:', err.name, err.message)
      stopHeartbeat() // Heartbeat'i durdur
    })

    ws.on('close', (code, reason) => {
      errorLog(`WebSocket closed. Code: ${code}, Reason: ${reason || 'No reason'}`)
      stopHeartbeat() // Heartbeat'i durdur
      isReconnecting = true
      reconnectionCount++

      let interval = reconnectionInterval()
      devLog(`Reconnecting in ${interval}ms... (Attempt ${reconnectionCount}/${MAX_RECONNECTION_COUNT})`)

      setTimeout(() => {
        connectServer()
      }, interval)
    })

  } catch (err) {
    errorLog('connectServer error:', err)
    stopHeartbeat()
    isReconnecting = true
    reconnectionCount++

    let interval = reconnectionInterval()
    devLog(`Reconnecting after error in ${interval}ms...`)

    setTimeout(() => {
      connectServer()
    }, interval)
  }
}
