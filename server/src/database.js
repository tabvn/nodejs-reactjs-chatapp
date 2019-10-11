import {MongoClient} from 'mongodb'

const URL = 'mongodb://mongo:27017';


export default class Database{

	connect(){


		return new Promise((resolve, reject) => {

			MongoClient.connect(URL, (err, db) => {
				
				return err ? reject(err) : resolve(db);

			});


		});



	}
}