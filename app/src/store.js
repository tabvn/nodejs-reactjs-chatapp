import {OrderedMap} from 'immutable'
import _ from 'lodash'
import Service from './service'
import Realtime from './realtime'

export default class Store {
    constructor(appComponent) {

        this.app = appComponent;
        this.service = new Service();
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;


        this.token = this.getTokenFromLocalStore();

        this.user = this.getUserFromLocalStorage();
        this.users = new OrderedMap();

        this.search = {
            users: new OrderedMap(),
        }


        this.realtime = new Realtime(this);

        this.fetchUserChannels();


    }

    isConnected(){

        return this.realtime.isConnected;
    }
    fetchUserChannels(){

        const userToken = this.getUserTokenId();

        if(userToken){


            const options = {
                headers: {
                    authorization: userToken,
                }
            }

            this.service.get(`api/me/channels`, options).then((response) => {

                const channels = response.data;

                _.each(channels, (c) => {

                    this.realtime.onAddChannel(c);
                });


                const firstChannelId = _.get(channels, '[0]._id', null);

                this.fetchChannelMessages(firstChannelId);


            }).catch((err) => {

                console.log("An error fetching user channels", err);
            })
        }
    }

    addUserToCache(user) {

        user.avatar = this.loadUserAvatar(user);
        const id = _.toString(user._id);
        this.users = this.users.set(id, user);


        return user;


    }

    getUserTokenId() {
        return _.get(this.token, '_id', null);
    }

    loadUserAvatar(user) {

        return `https://api.adorable.io/avatars/100/${user._id}.png`
    }

    startSearchUsers(q = "") {

        // query to backend servr and get list of users.
        const data = {search: q};

        this.search.users = this.search.users.clear();

        this.service.post('api/users/search', data).then((response) => {

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


            //console.log("searching errror", err);
        })

    }

    setUserToken(accessToken) {

        if (!accessToken) {

            this.localStorage.removeItem('token');
            this.token = null;

            return;
        }

        this.token = accessToken;
        localStorage.setItem('token', JSON.stringify(accessToken));

    }

    getTokenFromLocalStore() {


        if (this.token) {
            return this.token;
        }

        let token = null;

        const data = localStorage.getItem('token');
        if (data) {

            try {

                token = JSON.parse(data);
            }
            catch (err) {

                console.log(err);
            }
        }

        return token;
    }

    getUserFromLocalStorage() {

        let user = null;
        const data = localStorage.getItem('me');
        try {

            user = JSON.parse(data);
        }
        catch (err) {

            console.log(err);
        }


        if (user) {

            // try to connect to backend server and verify this user is exist.
            const token = this.getTokenFromLocalStore();
            const tokenId = _.get(token, '_id');

            const options = {
                headers: {
                    authorization: tokenId,
                }
            }
            this.service.get('api/users/me', options).then((response) => {

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

    setCurrentUser(user) {


        // set temporary user avatar image url
        user.avatar = this.loadUserAvatar(user);
        this.user = user;


        if (user) {
            localStorage.setItem('me', JSON.stringify(user));

            // save this user to our users collections in local 
            const userId = `${user._id}`;
            this.users = this.users.set(userId, user);
        }

        this.update();

    }

    clearCacheData(){

        this.channels = this.channels.clear();
        this.messages = this.messages.clear();
        this.users = this.users.clear();
    }
    signOut() {

        const userId = _.toString(_.get(this.user, '_id', null));
        const tokenId = _.get(this.token, '_id', null); //this.token._id;
        // request to backend and loggout this user

        const options = {
            headers: {
                authorization: tokenId,
            }
        };

        this.service.get('api/me/logout', options);

        this.user = null;
        localStorage.removeItem('me');
        localStorage.removeItem('token');

        this.clearCacheData();

        if (userId) {
            this.users = this.users.remove(userId);
        }

        this.update();
    }

    register(user){

        return new Promise((resolve, reject) => {

            this.service.post('api/users', user).then((response) => {

                console.log("use created", response.data);

                return resolve(response.data);
            }).catch(err => {

                return reject("An error create your account");
            })


        });
    }
    login(email = null, password = null) {

        const userEmail = _.toLower(email);


        const user = {
            email: userEmail,
            password: password,
        }
        //console.log("Ttrying to login with user info", user);


        return new Promise((resolve, reject) => {


            // we call to backend service and login with user data

            this.service.post('api/users/login', user).then((response) => {

                // that mean successful user logged in

                const accessToken = _.get(response, 'data');
                const user = _.get(accessToken, 'user');

                this.setCurrentUser(user);
                this.setUserToken(accessToken);

                // call to realtime and connect again to socket server with this user

                this.realtime.connect();

                // begin fetching user's channels

                this.fetchUserChannels();

                //console.log("Got user login callback from the server: ", accessToken);


            }).catch((err) => {

                console.log("Got an error login from server", err);
                // login error

                const message = _.get(err, 'response.data.error.message', "Login Error!");

                return reject(message);
            })

        });


    }

    removeMemberFromChannel(channel = null, user = null) {

        if (!channel || !user) {
            return;
        }

        const userId = _.get(user, '_id');
        const channelId = _.get(channel, '_id');

        channel.members = channel.members.remove(userId);

        this.channels = this.channels.set(channelId, channel);

        this.update();

    }

    addUserToChannel(channelId, userId) {


        const channel = this.channels.get(channelId);

        if (channel) {

            // now add this member id to channels members.
            channel.members = channel.members.set(userId, true);
            this.channels = this.channels.set(channelId, channel);
            this.update();
        }

    }

    getSearchUsers() {

        return this.search.users.valueSeq();
    }

    onCreateNewChannel(channel = {}) {

        const channelId = _.get(channel, '_id');
        this.addChannel(channelId, channel);
        this.setActiveChannelId(channelId);

        //console.log(JSON.stringify(this.channels.toJS()));

    }

    getCurrentUser() {

        return this.user;
    }


    fetchChannelMessages(channelId){


        let channel = this.channels.get(channelId);

        if (channel && !_.get(channel, 'isFetchedMessages')){

            const token = _.get(this.token, '_id');//this.token._id;
            const options = {
                headers: {
                    authorization: token,
                }
            }

             this.service.get(`api/channels/${channelId}/messages`, options).then((response) => {



                    channel.isFetchedMessages = true;

                    const messages = response.data;

                    _.each(messages, (message) => {

                            this.realtime.onAddMessage(message);

                    });


                    this.channels = this.channels.set(channelId, channel);




            }).catch((err) => {

                console.log("An error fetching channel 's messages", err);
            })


        }
        
    }
    setActiveChannelId(id) {

        this.activeChannelId = id;

        this.fetchChannelMessages(id);

        this.update();

    }


    getActiveChannel() {

        const channel = this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
        return channel;

    }

    setMessage(message, notify = false) {

        const id = _.toString(_.get(message, '_id'));
        this.messages = this.messages.set(id, message);
        const channelId = _.toString(message.channelId);
        const channel = this.channels.get(channelId);

        if (channel) {
            channel.messages = channel.messages.set(id, true);
            channel.lastMessage = _.get(message, 'body', '');
            channel.notify = notify;

            this.channels = this.channels.set(channelId, channel);
        } else {

            // fetch to the server with channel info
            this.service.get(`api/channels/${channelId}`).then((response) => {


                const channel = _.get(response, 'data');

                /*const users = _.get(channel, 'users');
                _.each(users, (user) => {

                    this.addUserToCache(user);
                });*/

                this.realtime.onAddChannel(channel);


            })
        }
        this.update();
    }

    addMessage(id, message = {}) {

        // we need add user object who is author of this message


        const user = this.getCurrentUser();
        message.user = user;

        this.messages = this.messages.set(id, message);

        // let's add new message id to current channel->messages.

        const channelId = _.get(message, 'channelId');
        if (channelId) {

            let channel = this.channels.get(channelId);


            channel.lastMessage = _.get(message, 'body', '');

            // now send this channel info to the server
            const obj = {

                action: 'create_channel',
                payload: channel,
            };
            this.realtime.send(obj);


            //console.log("channel:", channel);

            // send to the server via websocket to creawte new message and notify to other members.

            this.realtime.send(
                {
                    action: 'create_message',
                    payload: message,
                }
            );

            channel.messages = channel.messages.set(id, true);


            channel.isNew = false;
            this.channels = this.channels.set(channelId, channel);


        }
        this.update();

        // console.log(JSON.stringify(this.messages.toJS()));

    }

    getMessages() {

        return this.messages.valueSeq();
    }

    getMessagesFromChannel(channel) {

        let messages = new OrderedMap();


        if (channel) {


            channel.messages.forEach((value, key) => {


                const message = this.messages.get(key);

                messages = messages.set(key, message);

            });

        }

        return messages.valueSeq();
    }

    getMembersFromChannel(channel) {

        let members = new OrderedMap();

        if (channel) {


            channel.members.forEach((value, key) => {


                const userId = `${key}`;
                const user = this.users.get(userId);

                const loggedUser = this.getCurrentUser();

                if (_.get(loggedUser, '_id') !== _.get(user, '_id')) {
                    members = members.set(key, user);
                }


            });
        }

        return members.valueSeq();
    }

    addChannel(index, channel = {}) {
        this.channels = this.channels.set(`${index}`, channel);

        this.update();
    }

    getChannels() {

        //return this.channels.valueSeq();

        // we need to sort channel by date , the last one will list on top.


        this.channels = this.channels.sort((a, b) => a.updated < b.updated);

        return this.channels.valueSeq();
    }

    update() {

        this.app.forceUpdate()
    }
}