import React,{Component} from 'react'


export default class UserMenu extends Component{

	constructor(props){
		super(props);



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



	render(){

		const {store} = this.props;

		return <div className="user-menu" ref={(ref) => this.ref = ref}>
				<h2>My menu</h2>
				<ul className="menu">
					<li><button type="button">My Profile</button></li>
					<li><button type="button">Change Password</button></li>
					<li><button onClick={() => {
						if(this.props.onClose){
							this.props.onClose();
						}
						
						store.signOut();

					}} type="button">Sign Out</button></li>
				</ul>

		</div>
	}
}