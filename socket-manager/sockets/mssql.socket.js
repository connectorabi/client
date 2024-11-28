module.exports = (socket, params) => {
	try {
		const sql = require('mssql')
		if (params.config) {
			params.config.connectionTimeout = 180000
			params.config.requestTimeout = 180000
		}

		sql.connect(params.config)
			.then(pool => {
				if (params.query) {
					pool.query(params.query)
						.then(result => {
							if (result.recordsets && result.recordset) {
								delete result.recordset
							}
							sendSuccess(result, params.callback)
						})
						.catch(err => sendError(err, params.callback))
						.finally(() => pool.close())
				} else {
					pool.close()
					sendSuccess(true, params.callback)
				}
			})
			.catch(err => sendError(err, params.callback))

	} catch (err) {
		sendError(err, params.callback)
	}
}
