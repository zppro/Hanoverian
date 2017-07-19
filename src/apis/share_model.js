/**
 * Created by zppro on 17-7-13.
 */

import log4js from 'log4js'
import { responser, mongoFactory } from 'cube-brick'

const shareModel = {
  init: function (routerUrl, initOptions) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
      {
        method: 'create',
        verb: 'post',
        url: `${self.routerUrl}/:model`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.ret(await mongoFactory().create(ctx.params.model, ctx.request.body))
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'read',
        verb: 'get',
        url: `${self.routerUrl}/:model/:_id`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let _id = ctx.params._id
              if (_id === '$one') {
                let theOne = await mongoFactory().one(ctx.params.model, {
                  where: ctx.query,
                  select: '_id '
                })
                if (theOne) {
                  ctx.body = responser.ret(theOne)
                } else {
                  ctx.body = responser.ret({_id: null})
                }
              }
              else {
                let instance = await mongoFactory().read(ctx.params.model, _id)
                ctx.body = app.wrapper.res.ret(instance)
              }
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'update',
        verb: 'put',
        url: `${self.routerUrl}/:model/:_id`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let ret = await mongoFactory().update(ctx.params.model, ctx.params._id, ctx.request.body)
              ctx.body = responser.ret(ret)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'delete',
        verb: 'delete',
        url: `${self.routerUrl}/:model/:_id`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.ret(await mongoFactory().delete(ctx.params.model, ctx.params._id))
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'list',
        verb: 'get',
        url: `${self.routerUrl}/:model`,
        handler: (app) => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows(await mongoFactory().query(ctx.params.model))
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'query',
        verb: 'post',
        url: `${self.routerUrl}/:model/$query`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let rows = mongoFactory().query(ctx.params.model, ctx.request.body)
              let populates = ctx.request.body.populates
              if (populates) {
                if (Array.isArray(populates)) {
                  populates.forEach(p => { rows = rows.populate(p) })
                } else {
                  rows = rows.populate(populates)
                }
              }
              ctx.body = responser.rows(await rows)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'single',
        verb: 'post',
        url: `${self.routerUrl}/:model/$single`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let theOne = mongoFactory().one(ctx.params.model, ctx.request.body)
              let populates = ctx.request.body.populates
              if (populates) {
                if (Array.isArray(populates)) {
                  populates.forEach(p => { theOne = theOne.populate(p) })
                } else {
                  theOne = theOne.populate(populates)
                }
              }
              ctx.body = responser.rows(await theOne)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'totals',
        verb: 'post',
        url: `${self.routerUrl}/:model/$totals`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.ret((await mongoFactory().totals(ctx.params.model, ctx.request.body)).length)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'bulkInsert',
        verb: 'post',
        url: `${self.routerUrl}/:model/$bulkInsert`,
        handler: app => {
          return async (ctx, next) => {
            try {
              await mongoFactory().bulkInsert(ctx.params.model, ctx.request.body)
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
        method: 'bulkUpdate',
        verb: 'post',
        url: `${self.routerUrl}/:model/$bulkUpdate`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let ret = await mongoFactory().bulkUpdate(ctx.params.model, ctx.request.body)
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

export default shareModel
