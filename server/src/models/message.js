import _ from 'lodash'
import {OrderedMap} from 'immutable'
import {ObjectID} from 'mongodb'

export default class Message {

    constructor(app) {
        this.app = app;
        this.messages = new OrderedMap();
    }


    create(obj) {


        return new Promise((resolve, reject) => {


            let id = _.get(obj, '_id', null);
            id = _.toString(id);

            const userId = new ObjectID(_.get(obj, 'userId'));
            const channelId = new ObjectID(_.get(obj, 'channelId'));

            const message = {
                _id: new ObjectID(id),
                body: _.get(obj, 'body', ''),
                userId: userId,
                channelId: channelId,
                created: new Date(),
            };


            this.app.db.collection('messages').insertOne(message, (err, info) => {

                if(err){
                    return reject(err);
                }


                this.app.models.user.load(_.toString(userId)).then((user) => {

                    _.unset(user, 'password');
                    _.unset(user, 'email');
                    message.user = user;


                    return resolve(message);

                }).catch((err) => {

                    return reject(err);
                });
            });


        });
    }

}