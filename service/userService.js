const User = require('../models/user')

exports.getUserInfo = async (ctx) => {
  try {
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
    } else {
      // await user.updateOne({})
    }
    return user
  } catch (error) {
    console.log('error', error)
  }
}
