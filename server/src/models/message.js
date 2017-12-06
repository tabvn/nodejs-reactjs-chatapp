import _ from 'lodash'
import {OrderedMap} from 'immutable'
import {ObjectID} from 'mongodb'

export default class Message {

    constructor(app) {
        this.app = app;
        this.messages = new OrderedMap();
    }

    getChannelMessages(channelId, limit = 50, offset = 0){

        return new Promise((resolve, reject) => {

            channelId = new ObjectID(channelId);

            const query = [
                {

                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $match: {
                        'channelId': {$eq: channelId},
                    },
                },
                {
                    $project: {
                        _id: true,
                        channelId: true,
                        user: {_id: true, name: true, created: true},
                        userId: true,
                        body: true,
                        created: true,
                    }
                },
                {
                    $limit: limit
                },
                {
                    $skip: offset,
                },
                {
                    $sort: {created: -1}
                }

            ];


            this.app.db.collection('messages').aggregate(query, (err, results) => {

                

                return err ? reject(err): resolve(results)

            });


        })
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


                // let update lastMessgage field to channel
                this.app.db.collection('channels').findOneAndUpdate({_id: channelId}, {
                    $set: {
                        lastMessage: _.get(message, 'body', ''),
                        updated: new Date(),
                    }
                })

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