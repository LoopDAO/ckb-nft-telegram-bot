require('dotenv').config()
const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start(async (ctx) => {
  const sender = ctx.from
  const username = sender.username
  let message = `<b>Welcome to Mars ${username}</b>! I am your bot. I am here to help manage your groups and token holders. Choose below to get started.`
  ctx.replyWithHTML(message)
})

bot.command('xxx', async (ctx) => {
  try {
  } catch (error) {
    console.log('error', error)
    ctx.reply('error sending image')
  }
})

bot.launch()
