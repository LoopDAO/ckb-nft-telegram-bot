const { Markup } = require('telegraf')
const fs = require('fs')

exports.registerStartMenu = async (bot) => {
  bot.start(async (ctx) => {
    console.log('ctx.user...', ctx.user)
    const user = ctx.user
    const chat = ctx.chat
    if (chat.type === 'private') {
      const username = ctx.from.username
      let message = `<b>Welcome to ${process.env.BOT_NAME} ${username}</b>! I am your bot. I am here to help manage your groups and NFT holders. Choose below to get started.`
      let inlineButtons = []
      if (user?.groups?.length > 0) {
        inlineButtons = [Markup.button.callback(`🍃 Group Admin`, 'groupAdmin')]
      } else {
        inlineButtons = [
          Markup.button.callback(`🍋 Setup NFT Holders Group`, 'setup')
        ]
      }
      return await ctx.replyWithAnimation(
        { source: fs.readFileSync('./assets/robot.gif') },
        {
          caption: message,
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard(inlineButtons)
        }
      )
    }
    const startPayload = ctx.startPayload

    if (startPayload === 'c') {
      const message = `Thank you for adding me to the group. Please make sure to promote me as an administrator.`
      await ctx.reply(message)
      await ctx.telegram.sendMessage(
        ctx.from.id,
        message,
        Markup.inlineKeyboard([
          Markup.button.callback('🌸 Config NFT Holders Group', 'config')
        ])
      )
    }
  })
}
