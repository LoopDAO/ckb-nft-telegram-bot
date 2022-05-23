const { getUserInfo } = require('../service/userService.ts')

exports.attachUser = async (ctx, next) => {
  if (ctx.from) {
    const user = await getUserInfo(ctx)
    ctx.user = user
  }
  return next()
}
