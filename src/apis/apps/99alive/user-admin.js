/**
 * Created by zppro on 17-7-31.
 */

import log4js from 'log4js'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import utils, { responser } from 'cube-brick'

const service = {
  init: function (routerUrl, {ctx, log_name}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(log_name)
    this.logger4js.info(`${__filename} loaded!`)
    this.logger4js.info(`${routerUrl}`)
    this.actions = [
      {
        method: 'test',
        verb: 'get',
        url: `${self.routerUrl}/test`,
        handler: app => {
          return async (ctx, next) => {
            try {


              ctx.body = responser.ret({name: 'my-zppro', tested: true})
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'signin',
        verb: 'get',
        url: `${self.routerUrl}/signin/:username,:pass,:signin_ts`,
        handler: app => {
          return async (ctx, next) => {
            try {
              if (Number(ctx.params.signin_ts) !== ctx.session.signin_ts) {
                ctx.body = responser.error({message: '无效的参数3!'})
                await next
                return
              }

              let user = {id: ctx.params.username, name: ctx.params.username}
              let signed = `${app.conf.secure.authSecret}:${moment().format('YYYY-MM-DD')}:${ctx.session.signin_ts}`
              let token = jwt.sign(user, signed)
              console.log('ua sign in:', user, token, ' signed:', signed)
              ctx.cookies.set('token', token) //, {path:'/', httpOnly: false, overwrite: true}
              ctx.cookies.set('signin_ts', ctx.session.signin_ts)
              ctx.session.signin_ts = undefined
              // console.log('cookie token:', ctx.cookies.get('token'), {path:'/', httpOnly: false, overwrite: true})
              ctx.body = responser.ret({user, token})
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'signout',
        verb: 'get',
        url: `${self.routerUrl}/signout`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.cookies.set('token', undefined)
              ctx.cookies.set('signin_ts', undefined)
              ctx.body = responser.default()
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
