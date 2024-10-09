const mysql = require('mysql')
module.exports = (socket, params) => {
	try {
		const con = mysql.createConnection(params.config)
		con.connect(err => {
			if (!err) {
				if (params.query) {
					con.query(params.query, function (err, result, fields) {
						if (!err)
              sendSuccess( result, params.callback)
						else
              sendError(err, params.callback)
					})
				} else {
					sendSuccess( true, params.callback)
				}
			} else {
				sendError(err, params.callback)
			}
		})
	} catch (err) {
		sendError(err, params.callback)
	}
}
