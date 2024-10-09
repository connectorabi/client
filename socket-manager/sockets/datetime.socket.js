module.exports = (socket, params) => {
	try {
    let data=new Date().toISOString()
		sendSuccess( data, params.callback)
		

	} catch (err) {
		sendError(err, params.callback)
	}
}
