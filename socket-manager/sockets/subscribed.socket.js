module.exports = (socket, msg) => {
	eventLog('[subscribed]'.cyan, msg.data.message.green, msg.data.uuid)
}
