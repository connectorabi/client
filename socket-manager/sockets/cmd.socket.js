const cmd=require('node-cmd')
module.exports = (socket, params) => {
	try {
		let command=params.command || ''
		if(command){
      cmd.run(command,(err,data,stderr)=>{
        if(!err){
          sendSuccess( data, params.callback)
        }else{
          sendError(stderr,params.callback)
        }
      })
    }else{
      sendError('Command is required',params.callback)
    }
			
		

	} catch (err) {
		sendError(err, params.callback)
	}
}
