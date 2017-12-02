import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import {version} from '../package.json'
import WebSocketServer, {Server} from 'uws';
import AppRouter from './app-router'
import Model from './models'
import Database from './database'

const PORT = 3001;
const app = express();
app.server = http.createServer(app);


//app.use(morgan('dev'));


app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));


// Connect to Mongo Database

new Database().connect().then((db) => {

	console.log("Successful connected to database.")

	app.db = db;
	
}).catch((err) => {


	throw(err);
});


// End connect to Mongodb Database

app.models = new Model(app);
app.routers = new AppRouter(app);



app.wss = new Server({
	server: app.server
});


/*
let clients = [];


app.wss.on('connection', (connection) => {


	

	const userId = clients.length + 1;

	

	connection.userId = userId;


	const newClient = {
		ws: connection,
		userId: userId,
	};


	clients.push(newClient);

	console.log("New client connected with userId:", userId);


	connection.on('message', (message) => {


		console.log("message from:", message);


	});



	connection.on('close', () => {

		console.log("client with ID ", userId, ' is disconnected');


		clients = clients.filter((client) => client.userId !== userId);

	});

});
*/





app.server.listen(process.env.PORT || PORT, () => {
        console.log(`App is running on port ${app.server.address().port}`);
});

export default app;