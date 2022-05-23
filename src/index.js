require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { registerHandlers } = require('./handlers')
const { attachUser } = require('./middlewares/attachUser')
const { saveMemberInfo } = require('./service/userService.ts')
const jwt = require('jsonwebtoken')
const { validateSignature, getWalletAddress } = require('./utils')
const cron = require('node-cron')
const cota = require('./service/cotaService')

const token = process.env.BOT_TOKEN
if (token === undefined) {
    throw new Error('BOT_TOKEN must be provided!')
}
const HttpsProxyAgent = require('https-proxy-agent');
const proxyUrl = process.env.HTTPS_PROXY
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
const bot = new Telegraf(token, {
    telegram: {
        agent: agent
    }
})
console.log('bot...', bot)

//bot.start((ctx) => ctx.reply('Welcome'))
// bot.help((ctx) => ctx.reply('Send me a sticker'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))
// bot.hears('hi', (ctx) => ctx.reply('Hey there'))
// bot.launch()

const secretPath = `/telegraf/${bot.secretPathComponent()}`
// Set telegram webhook
bot.telegram.setWebhook(`${process.env.SERVER_URL}${secretPath}`)
console.log('process.env.SERVER_URL...', process.env.SERVER_URL)
console.log('secretPath...', process.env.secretPath)

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

    // cronjob to update discord roles once a day
    cron.schedule('0 0 * * *', () => {
        cota.banGroupMembers(bot)
    })
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
app.get('/api/wallet', async (req, res) => {
    const { flashsigner_data } = req.query
    if (!flashsigner_data) {
        console.log('flashsigner_data is undefined')
        return res.status(400).send('Missing flashsigner_data')
    }
    console.log("flashsigner_data...", flashsigner_data)
    const data = JSON.parse(flashsigner_data)
    if (data.code === 200) {
        console.log('data.result', data.result)
        try {
            const { lock, message, sig } = data.result
            console.log('lock...', lock)

            const isValidSig = validateSignature(message, sig)
            if (!isValidSig) {
                return res.send('Your signature is not valid!')
            }

            // TODO: use testnet address
            let address = getWalletAddress(sig)
            console.log('address....', address)
            const decoded = jwt.verify(message, process.env.TOKEN_SECRET)
            const { userId, groupName, groupId } = decoded
            /*
         send below message to a user who wanna join when bot is checking if the user's address has required nfts. Here will use ckb api to do the job
        */
            await bot.telegram.sendMessage(userId, 'Processing!!! Please wait...')

            const cotaCount = await cota.isQualified(address, groupId)
            if (cotaCount >0) {
                await saveMemberInfo({ ...decoded, walletAddress: address })
                // send below message if a user is approved to join group
                try {
                    // check if the user is a member of this group
                    await bot.telegram.getChatMember(groupId, userId)
                } catch (err) {
                    if (
                        err.response &&
                        err.response.description === 'Bad Request: user not found'
                    ) {
                        try {
                            await bot.telegram.approveChatJoinRequest(groupId, userId)
                        } catch (err) {
                            await bot.telegram.sendMessage(
                                userId,
                                `Sorry, you could not join ${groupName}`
                            )
                            return res.send(`Sorry, you could not join ${groupName}`)
                        }
                    }
                }
                const chat = await bot.telegram.getChat(groupId)
                console.log('chat...', chat)
                await bot.telegram.sendMessage(userId, `Welcome to ${groupName}`, {
                    ...Markup.inlineKeyboard([
                        Markup.button.url(`Join Group`, `${chat.invite_link}`)
                    ])
                })
                return res.send(`Welcome to ${groupName}`)
            } else {
                await bot.telegram.sendMessage(
                    userId,
                    `Sorry, you could not join ${groupName}`
                )
                return res.send(`Sorry, you could not join ${groupName}`)
            }
        } catch (err) {
            console.log('verify message err...', err)
        }
    }
})

app.listen(3000, () => {
    console.log('ckb-nft-telegram-bot app listening on port 3000!')
})
