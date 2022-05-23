const { Markup } = require("telegraf")
const fs = require("fs")
const { getGroupByInvitationCode } = require("../service/userService.ts")
const { getGroupInfoById } = require("../firebase/index.ts")
const jwt = require("jsonwebtoken")
const { generateSignMessageURL, Config } = require("@nervina-labs/flashsigner")

const mainnetURL = "https://flashsigner.com"
const testnetURL = "https://staging.flashsigner.work"

exports.registerStartMenu = async (bot) => {
  bot.start(async (ctx) => {
    const chainType = process.env.CHAIN_TYPE || "testnet"
      const network = chainType === "mainnet" ? mainnetURL : testnetURL
      
    Config.setFlashsignerURL(network)
    Config.setChainType(chainType)

    //console.log("ctx.update...", ctx.update.message)
    const user = ctx.user
    const chat = ctx.chat
    const startPayload = ctx.startPayload
    console.log("command:/start",user.lastName+'.'+user.firstName,chat.type)

    if (chat.type === "private") {
      if (startPayload && startPayload !== "c") {
        const group = await getGroupByInvitationCode(startPayload)
        if (group) {
          const sender = ctx.from
          const data = {
            userId: sender.id,
            firstName: sender?.first_name,
            lastName: sender?.last_name,
            isBot: sender?.is_bot,
            groupName: group.groupName,
            groupId: group.groupId,
          }
          const successURL = `${process.env.SERVER_URL}/api/wallet`          
          const token = jwt.sign(data, process.env.TOKEN_SECRET)

          const url = generateSignMessageURL(successURL, {
            message: token,
            isRaw: true,
          })
          return ctx.reply(
            `${group.groupName} is NFT holders chat room.`,
            Markup.inlineKeyboard([Markup.button.url(`Connect`, url)])
          )
        } else {
          return ctx.reply("Group not found.")
        }
      }

      const username = ctx.from.username
      let message = `<b>Welcome to ${process.env.BOT_NAME} ${username}</b>! I am your bot. I am here to help manage your groups and NFT holders. Choose below to get started.`
      let inlineButtons = []
      if (user?.groups?.length > 0) {
        inlineButtons = [Markup.button.callback(`🍃 Group Admin`, "groupAdmin")]
      } else {
        inlineButtons = [
          Markup.button.callback(`🍋 Setup NFT Holders Group`, "setup"),
        ]
      }
      return await ctx.replyWithAnimation(
        { source: fs.readFileSync("./src/assets/robot.gif") },
        {
          caption: message,
          parse_mode: "HTML",
          ...Markup.inlineKeyboard(inlineButtons),
        }
      )
    }

    if (startPayload === "c") {
      const message = `Thank you for adding me to the group. Please make sure to promote me as an administrator.`
      console.log("add to group ctx...", ctx.update.message.chat)

      await ctx.reply(message)
      await ctx.telegram.sendMessage(
        ctx.from.id,
        message,
        Markup.inlineKeyboard([
          Markup.button.callback("🌸 Config NFT Holders Group", "config"),
        ])
      )
    }
  })
  bot.action("groupAdmin", groupAdmin)

  async function groupAdmin(ctx) {
    const promises = ctx.user.groups.map(async (el) => {
        const group = await getGroupInfoById(el)
        if (group) {
            return [
                Markup.button.callback(
                    `🍏 ${group.groupName}`,
                    `groups::${group.groupId}::${group.groupName}`
                ),
            ]
        }
    })
    Promise.all(promises).then((groupList) => {
        ctx.reply(
          `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
          Markup.inlineKeyboard([
            ...groupList,
            [
              Markup.button.url(
                `Add ${process.env.BOT_NAME} to Group`,
                `https://t.me/${process.env.BOT_USER_NAME}?startgroup=c`
              ),
            ],
          ])
        )
    })
  }
}