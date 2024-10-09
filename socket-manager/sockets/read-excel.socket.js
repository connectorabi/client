const readXlsxFile = require('read-excel-file/node')
const readSheetNames = require('read-excel-file/node').readSheetNames

module.exports = (socket, params) => {
	try {
		let filePath=params.filePath
		if(!filePath)
			return sendError('filePath is required',params.callback)
		if(!fs.existsSync(filePath))
		return sendError(`File not found`,params.callback)

		let obj={}

		readSheetNames(filePath)
			.then(sheets => {
				let i = 0

				let calistir = () => new Promise((resolve, reject) => {
					if (i >= sheets.length)
						return resolve()
					let currSheetName=sheets[i]
					obj[currSheetName] = []
					readXlsxFile(filePath, { sheet: currSheetName })
						.then(rows => {
							obj[currSheetName] =rows
							i++
							setTimeout(()=>calistir().then(resolve).catch(reject), 0)
						})
						.catch(reject)

				})


				calistir()
					.then(() => sendSuccess(obj,params.callback))
					.catch(err=>sendError(err,params.callback))
			})
			.catch(err=>sendError(err, params.callback))

	} catch (err) {
		sendError(err, params.callback)
	}
}
