const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true
    },
    firstName: String,
    lastName: String,
    isBot: Boolean,
    username: String,
    groups: [
      {
        groupId: String,
        groupName: String,
        rules: [
          {
            network: String,
            type: String,
            address: String,
            minNumber: Number
          }
        ],
        _id: false
      }
    ]
  },
  { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

module.exports = User
