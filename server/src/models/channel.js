import _ from 'lodash'
import {toString} from '../helper'
import {ObjectID} from 'mongodb'
import {OrderedMap} from 'immutable'

export default class Channel {

    constructor(app) {

        this.app = app;

        this.channels = new OrderedMap();
    }


    aggregate(q){

        return new Promise((resolve, reject) => {


            this.app.db.collection('channels').aggregate(q, (err, results) => {


                    return err ? reject(err) : resolve(results);

            });


        })

    }
    find(q, options = {}){



        return new Promise((resolve, reject) => {


            this.app.db.collection('channels').find(q, options).toArray((err, results) => {


                return err ? reject(err) : resolve(results);
            });


        });
    }
    load(id) {

        return new Promise((resolve, reject) => {


            id = _.toString(id);


            // first find in cache
            const channelFromCache = this.channels.get(id);

            if (channelFromCache) {

				return resolve(channelFromCache);
            }


            // let find in db

            this.findById(id).then((c) => {

                this.channels = this.channels.set(id, c);
                
                return resolve(c);

            }).catch((err) => {


                return reject(err);
            })



        })

    }

    findById(id){

        return new Promise((resolve, reject) => {


            this.app.db.collection('channels').findOne({_id: new ObjectID(id)}, (err, result) => {

                    if(err || !result){

                        return reject(err ? err : "Not found");
                    }

                    return resolve(result);

            });


        })
    }
    create(obj) {


        return new Promise((resolve, reject) => {

            let id = toString(_.get(obj, '_id'));


            let idObject = id ? new ObjectID(id) : new ObjectID();


            let members = [];

            _.each(_.get(obj, 'members', []), (value, key) => {


                const memberObjectId = new ObjectID(key);
                members.push(memberObjectId);
            });


            let userIdObject = null;

            let userId = _.get(obj, 'userId', null);
            if (userId) {
                userIdObject = new ObjectID(userId);
            }


            const channel = {

                _id: idObject,
                title: _.get(obj, 'title', ''),
                lastMessage: _.get(obj, 'lastMessage', ''),
                created: new Date(),
                userId: userIdObject,
                members: members,
            }


            this.app.db.collection('channels').insertOne(channel, (err, info) => {

                if (!err) {

                    const channelId = channel._id.toString();

                    this.channels = this.channels.set(channelId, channel);
                }
                return err ? reject(err) : resolve(channel);
            });


        });


    }
}