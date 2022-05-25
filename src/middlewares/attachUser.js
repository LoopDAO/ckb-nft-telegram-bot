const { getUserInfo } = require("../service/userService.ts")

exports.attachUser = async (ctx, next) => {
  //console.log("attachUser...",ctx)
  console.log("attachUser...")
  if (ctx.from) {
    const user = await getUserInfo(ctx)
    ctx.user = user
  }
  return next()
}
