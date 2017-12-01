import User from './user'
import Token from './token'

export default class Model{

	constructor(app){

		this.app = app;

		this.user = new User(app);
		this.token = new Token(app);
	}
}