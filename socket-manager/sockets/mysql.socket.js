const mysql = require('mysql')
module.exports = (socket, params) => {
	let con = null
	try {
		con = mysql.createConnection(params.config)
		con.connect(err => {
			if (!err) {
				if (params.query) {
					con.query(params.query, function (err, result, fields) {
						if (!err) {
							sendSuccess(result, params.callback)
						} else {
							sendError(err, params.callback)
						}
						// Connection'ı kapat
						if (con) {
							con.end(closeErr => {
								if (closeErr) {
									errorLog('MySQL connection close error:', closeErr)
								}
							})
						}
					})
				} else {
					sendSuccess(true, params.callback)
					// Connection'ı kapat
					if (con) {
						con.end(closeErr => {
							if (closeErr) {
								errorLog('MySQL connection close error:', closeErr)
							}
						})
					}
				}
			} else {
				sendError(err, params.callback)
				// Bağlantı hatası olsa bile connection'ı kapatmaya çalış
				if (con) {
					con.destroy()
				}
			}
		})
	} catch (err) {
		sendError(err, params.callback)
		// Exception durumunda da connection'ı kapat
		if (con) {
			try {
				con.destroy()
			} catch (e) {
				errorLog('MySQL connection destroy error:', e)
			}
		}
	}
}
