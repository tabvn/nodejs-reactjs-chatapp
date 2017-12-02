import {OrderedMap} from 'immutable'
import _ from 'lodash'
import Service from './service'


export default class Store{
    constructor(appComponent){

        this.app = appComponent;
        this.service = new Service();
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;



        this.token = this.getTokenFromLocalStore();

        this.user =  this.getUserFromLocalStorage();
        this.users = new OrderedMap();

        this.search = {
            users: new OrderedMap(),
        }




    }

    loadUserAvatar(user){

        return `https://api.adorable.io/avatars/100/${user._id}.png`
    }
    startSearchUsers(q = ""){

        // query to backend servr and get list of users.
        const data = {search: q};

        this.search.users = this.search.users.clear();

        this.service.post('api/users/search', data).then((response) =>  {

            // list of users matched.
            const users = _.get(response, 'data', []);

            _.each(users, (user) => {

                // cache to this.users
                // add user to this.search.users 

                user.avatar = this.loadUserAvatar(user);
                const userId = `${user._id}`;

                this.users = this.users.set(userId, user);
                this.search.users = this.search.users.set(userId, user);





            });


            // update component
            this.update();


        }).catch((err) => {


            console.log("searching errror", err);
        })

    }

    setUserToken(accessToken){

        if(!accessToken){

            this.localStorage.removeItem('token');
            this.token = null;

            return;
        }

        this.token = accessToken;
        localStorage.setItem('token', JSON.stringify(accessToken));

    }
    getTokenFromLocalStore(){


        if(this.token){
            return this.token;
        }

        let token = null;

        const data = localStorage.getItem('token');
        if(data){

            try{

                token = JSON.parse(data);
            }
            catch(err){

                console.log(err);
            }
        }

        return token;
    }
    getUserFromLocalStorage(){

        let user = null;
        const data = localStorage.getItem('me');
        try{

            user = JSON.parse(data);
        }
        catch(err){

            console.log(err);
        }


        if(user){

            // try to connect to backend server and verify this user is exist.
            const token = this.getTokenFromLocalStore();
            const tokenId = _.get(token, '_id');

            const options = {
                headers: {
                    authorization: tokenId,
                }
            }
            this.service.get('api/users/me',options).then((response) => {

                // this mean user is logged with this token id.

                const accessToken = response.data;
                const user = _.get(accessToken, 'user');

                this.setCurrentUser(user);
                this.setUserToken(accessToken);

            }).catch(err => {

                this.signOut();

            });
            
        }
        return user;
    }
    setCurrentUser(user){


        // set temporary user avatar image url
        user.avatar = this.loadUserAvatar(user);
        this.user = user;



        if(user){
            localStorage.setItem('me', JSON.stringify(user));

            // save this user to our users collections in local 
            const userId = `${user._id}`;
            this.users = this.users.set(userId, user);
        }

        this.update();

    }
    signOut(){

        const userId = `${_.get(this.user, '_id', null)}`;

        this.user = null;
        localStorage.removeItem('me');
        localStorage.removeItem('token');

        if(userId){
             this.users = this.users.remove(userId);
        }
       
        this.update();
    }

    login(email = null, password = null){

        const userEmail = _.toLower(email);




        const user = {
            email: userEmail,
            password: password,
        }
        console.log("Ttrying to login with user info", user);


        return new Promise((resolve, reject) => {

            
            // we call to backend service and login with user data

            this.service.post('api/users/login', user).then((response) => {

                // that mean successful user logged in

                const accessToken = _.get(response, 'data');
                const user = _.get(accessToken, 'user');

                this.setCurrentUser(user);
                this.setUserToken(accessToken);

                console.log("Got user login callback from the server: ", accessToken);






            }).catch((err) => {

                console.log("Got an error login from server", err);
                // login error

                const message = _.get(err, 'response.data.error.message', "Login Error!");

                return reject(message);
            })

        });

        /*return new Promise((resolve, reject) => {


                const user = users.find((user) => user.email === userEmail);

                if(user){
                    _this.setCurrentUser(user);
                }
    

                return user ? resolve(user) : reject("User not found");


        }); */

    }
    removeMemberFromChannel(channel = null, user = null){

        if(!channel || !user){
            return;
        }

        const userId = _.get(user, '_id');
        const channelId = _.get(channel, '_id');

        channel.members = channel.members.remove(userId);

        this.channels = this.channels.set(channelId, channel);

        this.update();

    }
    addUserToChannel(channelId, userId){

    
        const channel = this.channels.get(channelId);

        if(channel){

            // now add this member id to channels members.
            channel.members = channel.members.set(userId, true);
            this.channels = this.channels.set(channelId, channel);
            this.update();
        }

    }
    getSearchUsers(){

        return this.search.users.valueSeq();
    }
    onCreateNewChannel(channel = {}){

        const channelId = _.get(channel, '_id');
        this.addChannel(channelId, channel);
        this.setActiveChannelId(channelId);

        //console.log(JSON.stringify(this.channels.toJS()));

    }

    getCurrentUser(){

        return this.user;
    }

    setActiveChannelId(id){

        this.activeChannelId = id;
        this.update();

    }
    getActiveChannel(){

        const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
        return channel;

    }
    addMessage(id, message = {}){

        // we need add user object who is author of this message

        const user = this.getCurrentUser();
        message.user = user;

        this.messages = this.messages.set(id, message);

        // let's add new message id to current channel->messages.

        const channelId = _.get(message, 'channelId');
        if(channelId){

            let channel = this.channels.get(channelId);

            channel.isNew = false;
            channel.lastMessage = _.get(message, 'body', '');

            channel.messages = channel.messages.set(id, true);
            this.channels = this.channels.set(channelId, channel);
        }
        this.update();

       // console.log(JSON.stringify(this.messages.toJS()));

    }
    getMessages(){

        return this.messages.valueSeq();
    }

    getMessagesFromChannel(channel){

        let messages = new OrderedMap();



        if(channel){


            channel.messages.forEach((value,key) => {


            

                const message = this.messages.get(key);

                messages = messages.set(key, message);

            });

        }

        return messages.valueSeq();
    }

    getMembersFromChannel(channel){

        let members = new OrderedMap();

        if(channel){


            channel.members.forEach((value, key) => {



                const userId = `${key}`;
                const user = this.users.get(userId);

                const loggedUser = this.getCurrentUser();

                if(_.get(loggedUser, '_id') !== _.get(user, '_id')){
                    members = members.set(key, user);
                }




            });
        }

        return members.valueSeq();
    }
    addChannel(index, channel = {}){
        this.channels = this.channels.set(`${index}`, channel);

        this.update();
    }
    getChannels(){

        //return this.channels.valueSeq();

        // we need to sort channel by date , the last one will list on top.


        this.channels = this.channels.sort((a, b) => a.created < b.created);

        return this.channels.valueSeq();
    }

    update(){

        this.app.forceUpdate()
    }
}