import {OrderedMap} from 'immutable'
import _ from 'lodash'

const users = OrderedMap({
    '1': {_id: '1', email: 'toan@tabvn.com', name: "Toan Nguyen Dinh", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@toan.png'},
    '2': {_id: '2', email: 'alex@tabvn.com', name: "Alexander Gov", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@alexander.png'},
    '3': {_id: '3', email: 'kevin@tabvn.com' ,name: "Kevin Smith", created: new Date(), avatar: 'https://api.adorable.io/avatars/100/abott@kevin.png'},
})

export default class Store{
    constructor(appComponent){

        this.app = appComponent;
        this.messages = new OrderedMap();
        this.channels = new OrderedMap();
        this.activeChannelId = null;




        this.user =  this.getUserFromLocalStorage();

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


        return user;
    }
    setCurrentUser(user){

        this.user = user;


        if(user){
            localStorage.setItem('me', JSON.stringify(user));
        }

        this.update();

    }
    signOut(){
        this.user = null;
        localStorage.removeItem('me');
        this.update();
    }
    login(email, password){

        const userEmail = _.toLower(email);

        const _this = this;

        return new Promise((resolve, reject) => {


                const user = users.find((user) => user.email === userEmail);

                if(user){
                    _this.setCurrentUser(user);
                }
    

                return user ? resolve(user) : reject("User not found");


        });

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
    searchUsers(search = ""){

        const keyword = _.toLower(search);
        
        let searchItems = new OrderedMap();
        const currentUser = this.getCurrentUser();
        const currentUserId = _.get(currentUser, '_id');

        if(_.trim(search).length){


            searchItems = users.filter((user) => _.get(user, '_id') !== currentUserId && _.includes(_.toLower(_.get(user, 'name')), keyword));


        }

        return searchItems.valueSeq();
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


                const user = users.get(key);

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