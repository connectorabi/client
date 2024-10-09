const { Client } = require('pg')
module.exports = (socket, params) => {
	try {
		const client = new Client(params.config)
		client
			.connect()
			.then(() => {
				if (params.query) {
					client.query(params.query)
						.then(result => sendSuccess( result, params.callback))
						.catch(err => sendError(err, params.callback))
						.finally(()=>client.end())
				} else {
					client.end()
					sendSuccess( true, params.callback)
				}
			})
			.catch(err => sendError(err, params.callback))

	} catch (err) {
		sendError(err, params.callback)
	}
}
