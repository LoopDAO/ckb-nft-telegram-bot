const e = require('express')
const User = require('../models/user')

exports.getUserInfo = async (ctx) => {
  try {
    console.log('getUserInfo ctx.update...', ctx.update)
    const chat = ctx.chat
    if (chat.type === 'private') {
      const sender = ctx.from
      let user = await User.findOne({ chatId: ctx.chat?.id })
      if (!user) {
        const userModel = new User({
          firstName: sender?.first_name,
          lastName: sender?.last_name,
          username: sender?.username,
          isBot: sender?.is_bot,
          chatId: ctx.chat?.id
        })
        user = await new User(userModel).save()
      }
      return user
    } else {
      let user = await User.findOne({ chatId: ctx.from?.id })
      if (user) {
        let index = user.groups.findIndex(
          (el) => el.groupId === chat.id.toString()
        )
        if (index === -1) {
          user.groups = [
            ...user.groups,
            { groupId: chat.id, groupName: chat.title }
          ]
          user = await user.save()
        }
      }
      return user
    }
  } catch (error) {
    console.log('error', error)
  }
}
