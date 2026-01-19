const sql = require('mssql')
module.exports = (socket, params) => {
	let pool = null
	try {

		// const ntSql = require('mssql/msnodesqlv8')

		if (params.config) {
			params.config.connectionTimeout = 18000
			params.config.requestTimeout = 600000
			// if (params.config.options && params.config.options.trustedConnection) {
			// 	params.config.driver = 'msnodesqlv8'
			// 	sql = ntSql
			// }
		}
		if (process.env.NODE_ENV === 'development') {
			console.log('MSSQL SOCKET PARAMS:', JSON.stringify(params))
		}
		sql.connect(params.config)
			.then(poolInstance => {
				pool = poolInstance
				if (params.query) {
					pool.query(params.query)
						.then(result => {
							if (result.recordsets && result.recordset) {
								delete result.recordset
							}
							sendSuccess(result, params.callback)
						})
						.catch(err => {
							sendError(err, params.callback)
						})
						.finally(() => {
							if (pool) {
								pool.close().catch(closeErr => {
									errorLog('MSSQL pool close error:', closeErr)
								})
							}
						})
				} else {
					if (pool) {
						pool.close().catch(closeErr => {
							errorLog('MSSQL pool close error:', closeErr)
						})
					}
					sendSuccess(true, params.callback)
				}
			})
			.catch(err => {
				sendError(err, params.callback)
				// Connection hatası durumunda pool varsa kapat
				if (pool) {
					pool.close().catch(closeErr => {
						errorLog('MSSQL pool close error after connection error:', closeErr)
					})
				}
			})

	} catch (err) {
		sendError(err, params.callback)
		// Exception durumunda pool varsa kapat
		if (pool) {
			pool.close().catch(closeErr => {
				errorLog('MSSQL pool close error after exception:', closeErr)
			})
		}
	}
}
