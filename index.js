require('dotenv').config()
const { Telegraf } = require('telegraf')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
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
app.post('/api/wallet', (req, res) => {
  const { id, address } = req.body
  const { chatId, groupName } = id
  /*
   send below message to a user who wanna join when bot is checking if the user's address has required nfts. Here will use ckb api to do the job
  */
  bot.telegram.sendMessage(chatId, 'Processing!!! Please wait...')

  // send below message if a user is approved to join group
  // save address to database
  bot.telegram.createChatInviteLink()
  bot.telegram.sendMessage(chatId, `Welcome to ${groupName}`, {
    ...Markup.inlineKeyboard([
      Markup.button.url(`Join Group`, `https://t.me/${groupName}`)
    ])
  })

  res.status(200)
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
