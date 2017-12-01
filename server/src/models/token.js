import moment from 'moment'

export default class Token{

	constructor(app){

		this.app = app;


	}



	create(userId){

		const token = {
			userId: userId,
			created: new Date(),
		}

		
		return new Promise((resolve, reject) => {


			this.app.db.collection('tokens').insertOne(token, (err, info) => {
				return err ? reject(err) : resolve(token);
			})



		})
	}



}