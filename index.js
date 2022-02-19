require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const base64 = require('js-base64')
const { registerHandlers } = require('./handlers')
const { attachUser } = require('./middlewares/attachUser')

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)
const secretPath = `/telegraf/${bot.secretPathComponent()}`
// Set telegram webhook
bot.telegram.setWebhook(`${process.env.SERVER_URL}${secretPath}`)

async function mainService() {
  mongoose.connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    (err) => {
      if (err) {
        console.error(err.message)
        console.error(err)
      } else {
        console.log('Connected to MongoDB')
      }
    }
  )
  bot.use(attachUser)
  // register all bot commands
  await registerHandlers(bot)
}
mainService()

// register global error handler to prevent the bot from stopping after an exception
bot.catch((err, ctx) => {
  console.error(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

const app = express()
app.use(bodyParser.json())

// Set the bot API endpoint
app.use(bot.webhookCallback(secretPath))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// deal with callback data when user connected wallet
app.post('/api/wallet', async (req, res) => {
  const { id, address } = req.body
  if (!id || !address)
    return res.json({
      ok: false,
      error_code: 400,
      description: 'invalid params'
    })
  const chatInfo = JSON.parse(base64.decode(id))
  const { userId, groupName, groupId } = chatInfo
  /*
   send below message to a user who wanna join when bot is checking if the user's address has required nfts. Here will use ckb api to do the job
  */
  await bot.telegram.sendMessage(userId, 'Processing!!! Please wait...')

  // TODO: save address to database

  // send below message if a user is approved to join group
  try {
    // should check if a user had joined to the group
    await bot.telegram.approveChatJoinRequest(groupId, userId)
  } catch (err) {
    console.log('err', err.response)
  }

  /* I'm not sure how to properly create the link of Join Group, and I think it is not right here to use the private invitation link of a group, because it will expose a group to sunshine.
   */
  await bot.telegram.sendMessage(userId, `Welcome to ${groupName}`, {
    ...Markup.inlineKeyboard([Markup.button.url(`Join Group`, `https://t.me/`)])
  })
  return res.json({ ok: true })
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
