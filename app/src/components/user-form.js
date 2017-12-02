import React,{Component} from 'react'
import _ from 'lodash'
import classNames from 'classnames'


export default class UserForm extends Component{

	constructor(props){

		super(props);


		this.state = {
			message: null,

			user: {
				email: '',
				password: ''
			}
		}

		this.onSubmit = this.onSubmit.bind(this);
		this.onTextFieldChange = this.onTextFieldChange.bind(this)

		this.onClickOutside = this.onClickOutside.bind(this);
	}

	onClickOutside(event){

		if(this.ref && !this.ref.contains(event.target)){

			


			if(this.props.onClose){
				this.props.onClose();
			}

		}
	}

	componentDidMount(){

		window.addEventListener('mousedown', this.onClickOutside);

	}
	componentWillUnmount(){

		window.removeEventListener('mousedown', this.onClickOutside);

	}
	onSubmit(event){
		const {user} = this.state;
		const {store} = this.props;

		event.preventDefault();

		this.setState({
			message: null,
		}, () => {


			store.login(user.email, user.password).then((user) => {

		

				if(this.props.onClose){
					this.props.onClose();
				}

			

			}).catch((err) => {

				console.log("err", err);

				this.setState({
					message: {
						body: err,
						type: 'error',
					}
				})
			});


		})
	
		

	}
	onTextFieldChange(event) {

		let {user} = this.state;


		const field = event.target.name;

		user[field] = event.target.value;

		this.setState({
			user: user
		});


	
	}

	render(){

		const {user, message} = this.state;

		return (

			<div className="user-form" ref={(ref) => this.ref = ref}>

				<form onSubmit={this.onSubmit} method="post">
					{message ? <p className={classNames('app-message', _.get(message, 'type'))}>{_.get(message, 'body')}</p>: null}
					<div className="form-item">
						<label>Email</label>
						<input value={_.get(user, 'email')} onChange={this.onTextFieldChange} type="email" placeholder="Email addresss..." name="email" />
					</div>

					<div className="form-item">
						<label>Password</label>
						<input value={_.get(user, 'password')} onChange={this.onTextFieldChange} type="password" placeholder="Password" name="password" />
					</div>

					<div className="form-actions">
						<button type="button">Create an account?</button>
						<button className="primary" type="submit">Sign In</button>
					</div>
				</form>
			</div>

		);
	}
}