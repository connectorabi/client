module.exports = (socket, params) => {
	try {
		let filePath = params.filePath
		let encoding = params.encoding || 'utf8'
		if (!filePath)
			return sendError('filePath is required', params.callback)
		if (!params.data)
			return sendError('data is required', params.callback)
		
    
		filePath=util.htmlEval(filePath)
		let data = params.data.data || params.data

		try {
			data = util.decodeBase64(data)
		} catch { }
		fs.writeFileSync(filePath, params.data, encoding)
    sendSuccess(filePath, params.callback)
	} catch (err) {
		sendError(err, params.callback)
	}
}
