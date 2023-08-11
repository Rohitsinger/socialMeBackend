const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: "true"
    },
 
    about: {
        type: String,
    },
    livesin: {
        type: String,
    },
    worksAt: {
        type: String,
    },
     posts: {
        type: ObjectId,
        ref: "Post"
    },
    followers: [
        {
            type: ObjectId,
            ref: "User"
        }
    ],
    following: [
        { type: ObjectId,
            ref: "User"
        }
    ],
},{timestamps:true})

const User = mongoose.model("User", userSchema)

module.exports = User