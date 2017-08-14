/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js'
import { responser } from 'cube-brick'
import captcha from 'trek-captcha'

const service = {
  init: function (routerUrl, initOptions = {}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
      {
        method: 'vcode2',
        verb: 'get',
        url: `${self.routerUrl}/vcode2`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let id = ctx.cookies.get(app.conf.session.key, app.sessionUtil)
              let session = app.sessionUtil.decode(id)
              console.log('sid:', id, session)
              ctx.body = ctx.session.vcode
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'vcode',
        verb: 'get',
        url: `${self.routerUrl}/vcode`,
        handler: app => {
          return async (ctx, next) => {
            try {
              const { token, buffer } = await captcha()
              ctx.session.vcode = token
              // app['notify_wodong'].sms('18668001381', `验证码:${token}[99为老网]`)
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
        method: 'vcode$verfiy',
        verb: 'post',
        url: `${self.routerUrl}/vcode`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('post vcode:', ctx.request.body, ctx.session.vcode)
              ctx.body =  responser.ret(ctx.request.body.vcode === ctx.session.vcode)
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
