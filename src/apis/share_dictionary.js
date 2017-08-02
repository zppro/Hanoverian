/**
 * Created by zppro on 17-7-17.
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
        method: 'fetch',
        verb: 'get',
        url: `${self.routerUrl}/:dictionaryId/:format`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let sys = ctx.params.dictionaryId.substr(0, 3).toLowerCase()
              const DICT = await import(`../pre-defined/dictionary-${sys}.json`)
              let dictionaryId = ctx.params.dictionaryId
              let format = ctx.params.format.toLowerCase()
              const dictionary = DICT[dictionaryId]
              if (dictionary) {
                if (format === 'array') {
                  let rows = []
                  for (let k in dictionary) {
                    k !== 'name' && rows.push({...dictionary[k], value: k})
                  }
                  ctx.body = responser.rows(rows)
                } else if (format === 'pair') {
                  ctx.body = responser.ret({key: dictionaryId, name: dictionary.name, value: utils.omit(dictionary, 'name')})
                } else {
                  ctx.body = responser.ret(dictionary)
                }
              } else {
                ctx.body = format === 'array' ? [] : {}
              }
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
