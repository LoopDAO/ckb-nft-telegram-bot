const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    chatId: {
      type: Number,
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
        ]
      }
    ]
  },
  { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

module.exports = User
