const WebSocket = require('uws');

const ws = new WebSocket('ws://localhost:3000');


ws.on('open', () => {

	console.log("Sucessful connected client 1 to the server.");


	// send new message from this client to server/

	ws.send('Hello server my name is client 1.');

	// listen new message

	ws.on('message', (message) => {

		console.log(message);

	});


});

