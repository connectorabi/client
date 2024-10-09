global.__root = __dirname
process.env.UPTIME_STARTED = new Date().toISOString()

require('./lib/initialize.js')()
  .then(() => {
    // if (process.env.NODE_ENV != 'development') {
    process.on('uncaughtException', err => {
      errorLog('Caught exception: ', err)
      socketManager()
    })
    process.on('unhandledRejection', reason => errorLog('Caught Rejection: ', reason))
    // }
    socketManager()

  })
  .catch(err => console.error(err))






function socketManager() {
  require('./socket-manager/socket-manager.js')()
    .then(() => {
      eventLog(`Application was started properly :-)`.yellow)
    })
    .catch(err => console.error(err))
}