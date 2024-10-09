module.exports = (socket, params) => {
  try {
    let filePath = params.filePath
    let encoding = params.encoding || 'base64'
    if (!filePath)
      return sendError('filePath is required', params.callback)

    if (!fs.existsSync(filePath))
      return sendError(`File not found`, params.callback)

    if (encoding == 'base64') {
      let s = fs.readFileSync(filePath, 'utf8')
      sendSuccess(util.encodeBase64(s), params.callback)
    } else if (encoding == 'utf8' || encoding == 'utf-8') {
      let s = fs.readFileSync(filePath, encoding)
      sendSuccess(s, params.callback)
    } else {
      let s = fs.readFileSync(filePath)
      sendSuccess(s, params.callback)
    }
  } catch (err) {
    sendError(err, params.callback)
  }
}
