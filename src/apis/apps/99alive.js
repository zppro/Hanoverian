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
              ctx.body = responser.ret({tpaNumbers: 88})
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$slidersInIndex',
        verb: 'get',
        url: `${self.routerUrl}/tpa/slidersInIndex`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: 'slider1', img: 'https://img2.okertrip.com/99alive-alpha/1.png'},
                {id: 'slider2', img: 'https://img2.okertrip.com/99alive-alpha/2.png'},
                {id: 'slider3', img: 'https://img2.okertrip.com/99alive-alpha/3.jpg'},
                {id: 'slider4', img: 'https://img2.okertrip.com/99alive-alpha/1.png'}
              ])
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
