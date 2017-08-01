/**
 * Created by zppro on 17-7-31.
 */

import log4js from 'log4js'

import utils, { responser } from 'cube-brick'

const service = {
  init: function (routerUrl, initOptions = {}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
      {
        method: 'tpa$stats',
        verb: 'get',
        url: `${self.routerUrl}/tpa/stats`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('################### /tpa/stats')
              ctx.body = responser.ret({tpaNumbers: 88})
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
