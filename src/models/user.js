const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConfigurationSchema = {
  network: String,
  nftType: String,
  address: String,
  minQuantity: Number,
  _id: false
}

const GroupSchema = {
  groupId: String,
  groupName: String,
  configurations: [ConfigurationSchema],
  invitationCode: String,
  _id: false
}

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
    groups: [GroupSchema]
  },
  { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

module.exports = User
