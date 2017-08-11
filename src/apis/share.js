/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js'
import { responser, mongoFactory } from 'cube-brick'
import captcha from 'trek-captcha'

const service = {
  init: function (routerUrl, initOptions = {}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
      {
        method: 'vcode',
        verb: 'get',
        url: `${self.routerUrl}/vcode`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('before invoke vcode token:', ctx.session.vcode, app.sessionUtil.decode(ctx.cookies.get(app.conf.session.key)))
              // console.log(ctx.res)
              const { token, buffer } = await captcha()
              ctx.session.vcode = token
              if(!ctx.res.session){
                ctx.res.session = {}
              }
              ctx.res.session.vcode = token
              // ctx.res.setHeader('set-cookie', ctx.res.session)
              console.log('vcode token:', ctx.session.vcode)
              console.log('vcode token res:', ctx.res.session)
              ctx.body = buffer
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'json',
        verb: 'get',
        url: `${self.routerUrl}/:json`,
        handler: app => {
          return async (ctx, next) => {
            try {
              const json = ctx.params.json
              ctx.body = responser.ret(await import(`../pre-defined/${json}`))
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      }
    ]
    return this
  }
}

export default service
