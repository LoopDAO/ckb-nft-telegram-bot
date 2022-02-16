require('dotenv').config()
const { Telegraf } = require('telegraf')
const express = require('express')
const mongoose = require('mongoose')
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
// Set the bot API endpoint
app.use(bot.webhookCallback(secretPath))

// deal with callback data when user connected wallet
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
