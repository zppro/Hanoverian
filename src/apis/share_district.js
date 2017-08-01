/**
 * Created by zppro on 17-7-31.
 */

import log4js from 'log4js'

import utils, { responser } from 'cube-brick'

import DISTRICTS from '../pre-defined/district.json'

const service = {
  init: function (routerUrl, initOptions = {}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
      {
        method: 'provinces',
        verb: 'get',
        url: `${self.routerUrl}/provinces/:fields?`, //fields-分割 => _id name-first_letter
        handler: app => {
          return async (ctx, next) => {
            try {
              let provinces
              if (ctx.params.fields) {
                provinces = utils.pick(DISTRICTS, ...ctx.params.fields.split(' '))
              } else {
                provinces = DISTRICTS
              }
              ctx.body = responser.rows(provinces)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'cities',
        verb: 'get',
        url: `${self.routerUrl}/cities/:proviceId?,:fields?`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let cities = []
              let filterProvince = ctx.params.proviceId ? DISTRICTS.filter(o => o._id === ctx.params.proviceId) : DISTRICTS
              filterProvince.reduce((arr, o) => arr.push(...o.children), cities)
              if (ctx.params.fields) {
                cities = utils.pick(cities, ...ctx.params.fields.split(' '))
              }
              cities = cities.sort((a, b) => {
                if (a.first_letter > b.first_letter) {
                  return 1;
                }
                if (a.first_letter < b.first_letter) {
                  return -1;
                }
                return 0;
              })
              ctx.body = responser.rows(cities)
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
