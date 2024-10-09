const writeXlsxFile  = require('write-excel-file/node')

module.exports = (socket, params) => {
	try {
		if(!params.filePath)
			return sendError('filePath is required',params.callback)

		let	filePath=util.htmlEval(params.filePath)
		let options={
			columns:params.columns,
			schema:params.schema,
			sheet:params.sheet,
			sheets:params.sheets,
			headerStyle:params.headerStyle,
			filePath:filePath,
			fontFamily: params.fontFamily,
  		fontSize: params.fontSize,
  		orientation: params.orientation,
  		dateFormat: params.dateFormat,
  		stickyRowsCount: params.stickyRowsCount,
  		stickyColumnsCount: params.stickyColumnsCount,
			
		}
		
		writeXlsxFile(params.data || [],options)
		.then(res=>sendSuccess(filePath,params.callback))
		.catch(err=>sendError(err,params.callback))

	} catch (err) {
		sendError(err, params.callback)
	}
}
