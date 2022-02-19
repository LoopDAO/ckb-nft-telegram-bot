const { Markup } = require('telegraf')
const fs = require('fs')

exports.registerStartMenu = async (bot) => {
  bot.start(async (ctx) => {
    const user = ctx.user
    const chat = ctx.chat
    const startPayload = ctx.startPayload

    if (chat.type === 'private') {
      const username = ctx.from.username
      let message = `<b>Welcome to ${process.env.BOT_NAME} ${username}</b>! I am your bot. I am here to help manage your groups and NFT holders. Choose below to get started.`
      let inlineButtons = []
      if (user?.groups?.length > 0) {
        if (startPayload) {
          const group = user.groups.filter(
            (el) => el.invitationCode === startPayload
          )[0]
          if (group) {
            const id = group.invitationCode
            const callback = `${process.env.SERVER_URL}/api/wallet`
            return ctx.reply(
              `${group.groupName} is NFT holders chat room.`,
              Markup.inlineKeyboard([
                Markup.button.url(
                  `Connect`,
                  `${process.env.CONNECT_WALLET_URL}?id=${id}&callbackURL=${callback}`
                )
              ])
            )
          }
        } else {
          inlineButtons = [
            Markup.button.callback(`🍃 Group Admin`, 'groupAdmin')
          ]
        }
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
  bot.action('groupAdmin', groupAdmin)

  async function groupAdmin(ctx) {
    const groupList = ctx.user.groups.map((el) => [
      Markup.button.callback(
        `🍏 ${el.groupName}`,
        `groups::${el.groupId}::${el.groupName}`
      )
    ])
    await ctx.reply(
      `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
      Markup.inlineKeyboard([
        ...groupList,
        [
          Markup.button.url(
            `Add ${process.env.BOT_NAME} to Group`,
            `https://t.me/${process.env.BOT_USER_NAME}?startgroup=c`
          )
        ]
      ])
    )
  }
}
