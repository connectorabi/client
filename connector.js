global.__root = __dirname
process.env.UPTIME_STARTED = new Date().toISOString()

require('./lib/initialize.js')()
  .then(() => {
    process.on('uncaughtException', err => errorLog('Caught exception: ', err))
    process.on('unhandledRejection', reason => errorLog('Caught Rejection: ', reason))
    socketManager()
  })
  .catch(err => console.error(err))

function socketManager() {
  let program = require('./socket-manager/socket-manager.js')
  program()
    .then(() => {
      eventLog(`Application was started properly :-)`.yellow)
    })
    .catch(err => {
      errorLog(err)
      program = undefined
      setTimeout(() => socketManager(), 10000)
    })
}