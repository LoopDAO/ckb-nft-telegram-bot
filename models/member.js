const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MemberSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    firstName: String,
    lastName: String,
    isBot: Boolean,
    walletAddress: String,
    groupId: String,
    groupName: String
  },
  { timestamps: true }
)

const Member = mongoose.model('Member', MemberSchema)

module.exports = Member
