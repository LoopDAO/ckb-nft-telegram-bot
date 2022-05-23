const ConfigurationSchema = {
  network: String,
  nftType: String,
  address: String,
  minQuantity: Number,
  _id: false,
}
const GroupSchema = {
  groupId: String,
  groupName: String,
  configurations: [ConfigurationSchema],
  invitationCode: String,
  _id: false,
}
const UserFirestore = {
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  isBot: Boolean,
  username: String,
  groups: [GroupSchema],
}
module.exports = UserFirestore
