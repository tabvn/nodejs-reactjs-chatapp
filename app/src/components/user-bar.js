import React, {Component} from 'react'
import _ from 'lodash'
import avatar from '../images/avatar.png'
import UserForm from './user-form'
import UserMenu from './user-menu'


export default class UserBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showUserForm: false,
            showUserMenu: false,
        }


    }

    render() {

        const {store} = this.props;

        const me = store.getCurrentUser();
        const profilePicture = _.get(me, 'avatar');
        const isConnected = store.isConnected();

        return (
            <div className="user-bar">
                {me && !isConnected ? <div className="app-warning-state">Reconnecting... </div> : null}
                {!me ? <button onClick={() => {

                    this.setState({
                        showUserForm: true,
                    })

                }} type="button" className="login-btn">Sign In</button> : null}
                <div className="profile-name">{_.get(me, 'name')}</div>
                <div className="profile-image" onClick={() => {

                    this.setState({
                        showUserMenu: true,
                    })

                }}><img src={profilePicture ? profilePicture : avatar} alt=""/></div>

                {!me && this.state.showUserForm ? <UserForm onClose={(msg) => {


                    this.setState({
                        showUserForm: false,
                    })

                }} store={store}/> : null}


                {this.state.showUserMenu ? <UserMenu
                    store={store}
                    onClose={() => {

                        this.setState({
                            showUserMenu: false,
                        })
                    }}

                /> : null}

            </div>
        );
    }
}