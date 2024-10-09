module.exports = (socket, data) => {
  if(data && data.clientId && data.clientPass){
    envSave('CLIENT_ID',data.clientId)
    envSave('CLIENT_PASS',data.clientPass)
    eventLog(`[Registered]`.brightMagenta,'CLIENT_ID:',process.env.CLIENT_ID.yellow,'CLIENT_PASS:',process.env.CLIENT_PASS.yellow)
    socket.send(JSON.stringify({ event: 'subscribe', clientId: process.env.CLIENT_ID, clientPass: process.env.CLIENT_PASS }))
  }

}
