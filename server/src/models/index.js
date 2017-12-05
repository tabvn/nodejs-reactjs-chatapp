import User from './user'
import Token from './token'
import Connection from './connection'
import Channel from './channel'
import Message from "./message";

export default class Model{

	constructor(app){

		this.app = app;

		this.user = new User(app);
		this.token = new Token(app);
		this.channel = new Channel(app);
		this.message = new Message(app);
		this.connection = new Connection(app);

	}
}