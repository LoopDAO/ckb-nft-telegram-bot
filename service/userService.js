const User = require('../models/user')

exports.getUserInfo = async (ctx) => {
  try {
    console.log('ctx', ctx.update)
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
        const groups = [{ groupId: chat.id, groupName: chat.title }]
        user.groups = groups
        user = await user.save()
      }
      return user
    }
  } catch (error) {
    console.log('error', error)
  }
}
