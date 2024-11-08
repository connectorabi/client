module.exports = (socket, params) => {
	try {
		console.log('params:', params)
		fetch(params.url, {
			method: params.method,
			headers: params.headers || { 'content-type': 'application/json' },
			body: typeof params.body === 'string' ? params.body : JSON.stringify(params.body || {})
		})
			.then(ret => ret.json())
			.then(result => {
				console.log('result:', result)
				sendSuccess(result, params.callback)
			})
			.catch(err => sendError(err, params.callback))

	} catch (err) {
		sendError(err, params.callback)
	}
}
