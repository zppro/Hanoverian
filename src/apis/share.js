/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js'
import { responser, mongoFactory } from 'cube-brick'

const service = {
  init: function (routerUrl, initOptions = {}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
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