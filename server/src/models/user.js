import _ from 'lodash'
import {isEmail} from '../helper'
import bcrypt from 'bcrypt'
import {ObjectID} from 'mongodb'
import {OrderedMap} from 'immutable'

const saltRound = 10;

export default class User{

	constructor(app){

		this.app = app;
		
		this.users = new OrderedMap();
		
	}


	find(query = {}, options = {}){


		return new Promise((resolve, reject) => {

			this.app.db.collection('users').find(query, options).toArray((err, users) => {

				return err ? reject(err) : resolve(users);
			})

		});	
	}

	search(q= ""){

		return new Promise((resolve, reject) => {


			const regex = new RegExp(q, 'i');

			const query = {
				$or: [
					{name: {$regex: regex}},
					{email: {$regex: regex}},
				],
			};

			this.app.db.collection('users').find(query, {_id: true, name: true, created: true}).toArray((err, results) => {


				if(err || !results || !results.length){

					return reject({message: "User not found."})
				}

				return resolve(results);
			});



		});
	}

	login(user){

		const email = _.get(user, 'email', '');
		const password = _.get(user, 'password', '');


		return new Promise((resolve, reject) => {


			if(!password || !email || !isEmail(email)){
				return reject({message: "An error login."})
			}


			// find in database with email 

			this.findUserByEmail(email, (err, result) => {


				if(err){

					return reject({message: "Login Error."});
				}


				// if found user we have to compare the password hash and plain text.


				const hashPassword = _.get(result, 'password');

				const isMatch = bcrypt.compareSync(password, hashPassword);

				
				if(!isMatch){

					return reject({message: "Login Error."});
				}

				// user login successful let creat new token save to token collection.

				const userId = result._id;

				this.app.models.token.create(userId).then((token) => {

					token.user = result;

					return resolve(token);

				}).catch(err => {

					return reject({message: "Login error"});
				})

				



			});





		})
		

	}

	findUserByEmail(email, callback = () => {}){


		this.app.db.collection('users').findOne({email: email}, (err, result) => {

			if(err || !result){

				return callback({message: "User not found."})
			}

			return callback(null, result);

		});


	}
	load(id){


		id = `${id}`;
		
		return new Promise((resolve, reject) => {

			// find in cache if found we return and dont nee to query db

			const userInCache = this.users.get(id);

		

			if(userInCache){
				return resolve(userInCache);
			}

			// if not found then we start query db
			this.findUserById(id, (err, user) => {

				if(!err && user){

				
					this.users = this.users.set(id, user);
				}

				return err ? reject(err) : resolve(user);

			})

			
		})
	}

	findUserById(id, callback = () => {}){

		//console.log("Begin query in database");

		if(!id){
			return callback({message: "User not found"}, null);
		}


		const userId = new ObjectID(id);

		this.app.db.collection('users').findOne({_id: userId}, (err, result) => {


			if(err || !result){

				return callback({message: "User not found"});
			}
			return callback(null, result);

		});
	}

	beforeSave(user, callback = () => {}){


		// first is validate user object before save to user collection.

		let errors = [];


		const fields = ['name', 'email', 'password'];
		const validations = {
			name: {
				errorMesage: 'Name is required',
				do: () => {

					const name = _.get(user, 'name', '');

					return name.length;
				}
			},
			email: {
				errorMesage: 'Email is not correct',
				do: () => {

					const email = _.get(user, 'email', '');

					if(!email.length || !isEmail(email)){
						return false;
					}


					return true;
				}
			},
			password: {
				errorMesage: 'Password is required and more than 3 characters',
				do: () => {
					const password = _.get(user, 'password', '');

					if(!password.length || password.length < 3){

						return false;
					}

					return true;
				}
			}
		}


		// loop all fields to check if valid or not.
		fields.forEach((field) => {


			const fieldValidation = _.get(validations, field);

			if(fieldValidation){

				// do check/

				const isValid = fieldValidation.do();
				const msg = fieldValidation.errorMesage;

				if(!isValid){
					errors.push(msg);
				}
			}


		});

		if(errors.length){

			// this is not pass of the validation.
			const err = _.join(errors, ',');
			return callback(err, null);
		}

		// check email is exist in db or not
		const email = _.toLower(_.trim(_.get(user, 'email','')));

		this.app.db.collection('users').findOne({email: email}, (err, result) => {

			if(err || result){
				return callback({message: "Email is already exist"}, null);
			}



			// return callback with succes checked.
			const password = _.get(user, 'password');
			const hashPassword = bcrypt.hashSync(password, saltRound);

			const userFormatted = {
				name: `${_.trim(_.get(user, 'name'))}`,
				email: email,
				password: hashPassword,
				created: new Date(),
			};


			return callback(null, userFormatted);


			

		});




	}
	create(user){

		const db = this.app.db;

		console.log("User:", user)

		return new Promise((resolve, reject) => {


			this.beforeSave(user, (err, user) => {


				console.log("After validation: ", err, user);


					if(err){
						return reject(err);
					}


					// insert new user object to users collections

					db.collection('users').insertOne(user, (err, info) => {


						// check if error return error to user
						if(err){
							return reject({message: "An error saving user."});
						}
						
						// otherwise return user object to user.

						const userId = _.get(user, '_id').toString(); // this is OBJET ID


						this.users = this.users.set(userId,user);

						return resolve(user);

					});

			});


		});
	}
}