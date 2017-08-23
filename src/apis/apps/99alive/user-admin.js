/**
 * Created by zppro on 17-7-31.
 */

import log4js from 'log4js'

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
              console.log('99alive/user-admin sigin:', Number(ctx.params.signin_ts), ctx.session)
              if (Number(ctx.params.signin_ts) !== ctx.session.signin_ts) {
                ctx.body = responser.error({message: '无效的参数[signin_ts]!'})
                await next
                return
              }


              ctx.body = responser.ret({name: ctx.params.username})
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
