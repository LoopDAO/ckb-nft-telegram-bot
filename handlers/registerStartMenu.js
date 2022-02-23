const { Markup } = require('telegraf')
const fs = require('fs')
const { getGroupInfo } = require('../service/userService')
const jwt = require('jsonwebtoken')
const { generateSignMessageURL } = require('@nervina-labs/flashsigner')

exports.registerStartMenu = async (bot) => {
  bot.start(async (ctx) => {
    console.log('ctx.update...', ctx.update.message)
    const user = ctx.user
    const chat = ctx.chat
    const startPayload = ctx.startPayload

    if (chat.type === 'private') {
      if (startPayload && startPayload !== 'c') {
        const group = await getGroupInfo(startPayload)
        if (group) {
          const sender = ctx.from
          const data = {
            userId: sender.id,
            firstName: sender?.first_name,
            lastName: sender?.last_name,
            isBot: sender?.is_bot,
            groupName: group.groupName,
            groupId: group.groupId
          }
          const successURL = `${process.env.SERVER_URL}/api/wallet`
          const token = jwt.sign(data, process.env.TOKEN_SECRET)
          const url = generateSignMessageURL(successURL, { message: token })
          console.log('generate url...', url)
          return ctx.reply(
            `${group.groupName} is NFT holders chat room.`,
            Markup.inlineKeyboard([Markup.button.url(`Connect`, url)])
          )
        }
      }

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

    if (startPayload === 'c') {
      const message = `Thank you for adding me to the group. Please make sure to promote me as an administrator.`
      console.log('add to group ctx...', ctx.update.message.chat)

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
