/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js'
import moment from 'moment'
import utils, { responser } from 'cube-brick'
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
        url: `${self.routerUrl}/vcode/verify`,
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
        method: 'mcode',
        verb: 'post',
        url: `${self.routerUrl}/mcode`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('post mcode:', ctx.request.body)
              const phone = ctx.request.body.phone
              if(!utils.isPhone(phone)){
                ctx.body = responser.error({message: `无效的手机号码!`})
                await next
                return
              }

              const last_mcode_on = ctx.session.last_mcode_on
              if (last_mcode_on && moment().diff(last_mcode_on) < 60 * 1000) {
                ctx.body = responser.error({message: `手机验证码冷却中!`})
                await next
                return
              }
              if (!ctx.session.mcode || (last_mcode_on && moment().diff(last_mcode_on) > 10 * 60 * 1000)) {
                // 验证码不存在 或者 超过10分钟 重新生成
                ctx.session.mcode = utils.randomN(6)
              }

              const signature = ctx.request.body.signature || '99为老网'
              let msg = ctx.request.body.msg
              if(!msg){
                msg = `${phone}用户,您的验证码:${ctx.session.mcode}【${signature}】`
              } else {
                msg = msg.replace(/\{\{mcode\}\}/g, ctx.session.mcode) + `【${signature}】`
              }
              console.log('before send:', phone, msg)
              await app['notify_wodong'].sms(phone, msg)
              ctx.session.last_mcode_on = new Date()
              ctx.body = responser.default()
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'mcode$verfiy',
        verb: 'post',
        url: `${self.routerUrl}/mcode/verify`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('post mcode/verify:', ctx.request.body, ctx.session.mcode)
              ctx.body =  responser.ret(ctx.request.body.mcode === ctx.session.mcode)
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
