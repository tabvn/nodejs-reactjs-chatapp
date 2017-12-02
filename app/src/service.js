import axios from 'axios'


const apiURL = 'http://localhost:3001';

export default class Service{

	get(endpoint, options = null){

		const url = `${apiURL}/${endpoint}`;

		return axios.get(url, options);
	}

	post(endpoint = "", data = {}, options = {headers: {'Content-Type': 'application/json'}}){

		const url = `${apiURL}/${endpoint}`;
		
		return axios.post(url, data, options);
	}

}