/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js'
import md5 from 'crypto-js/md5'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import utils, { responser, mongoFactory } from 'cube-brick'

import DIC from '../pre-defined/dictionary-constants.json'

const service = {
  init: async function (routerUrl, {ctx, log_name}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(log_name)
    this.logger4js.info(`${__filename} loaded!`)

    const appObjects = (await utils.readDirectoryStructure(ctx.conf.dir.apis + '/apps', {
      format: 'array',
      exts: '.js'
    }))
    this.appNames = appObjects.map(o => o.relative_path.substr(0, o.relative_path.lastIndexOf('.js')))
    // console.log('appNames:', appObjects, this.appNames)
    this.actions = [
      {
        method: 'apiToken',
        verb: 'get',
        url: `${self.routerUrl}/apiToken/:path`,
        handler: app => {
          return async (ctx, next) => {
            try {
              let {path} = ctx.params
              path = path.split('_').join('/')
              console.log('self.appNames:', self.appNames)
              console.log('path:',  path)
              if(!self.appNames.includes(path)) {
                ctx.body = responser.error({message: '无效的路径!'})
                await next
                return
              }
              // 需要对pass做hash
              ctx.session.api_token_ts = +new Date()
              ctx.body = responser.ret(ctx.session.api_token_ts)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'signinByToken',
        verb: 'get',
        url: `${self.routerUrl}/signinByToken/:token,:signin_ts`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('share app token:', ctx.params)
              let {token, signin_ts} = ctx.params
              let signed = `${app.conf.secure.authSecret}:${moment().format('YYYY-MM-DD')}:${signin_ts}`
              console.log('share app token:', token, ' signed:', signed)
              const payload = jwt.verify(token, signed)
              ctx.body = responser.ret(payload)
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
        verb: 'post',
        url: `${self.routerUrl}/signin`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('share app signin:', ctx.request.body)
              let {path, username, pass} = ctx.request.body
              if(!self.appNames.includes(path)) {
                ctx.body = responser.error({message: '非法的认证路径!'})
                await next
                return
              }
              if (pass.length !== 32) {
                pass = md5(pass).toString()
              }

              ctx.session.signin_ts = +new Date()
              // 需要对pass做hash
              ctx.redirect(`/apis/${path}/signin/${username},${pass},${ctx.session.signin_ts}`)
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
        verb: 'post',
        url: `${self.routerUrl}/signout`,
        handler: app => {
          return async (ctx, next) => {
            try {
              console.log('share app signout:', ctx.request.body)
              let { path } = ctx.request.body
              if(!self.appNames.includes(path)) {
                ctx.body = responser.error({message: '非法的认证路径!'})
                await next
                return
              }
              ctx.redirect(`/apis/${path}/signout`)
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'signin2',
        verb: 'post',
        url: `${self.routerUrl}/signin2`,
        handler: app => {
          return async (ctx, next) => {
            try {
              // console.log('ctx.request.body=>', ctx.request.body)
              let password = ctx.request.body.password
              if (password.length !== 32) {
                password = md5(password).toString()
              }

              // console.log('body:', ctx.request.body.code, password)
              let user = await mongoFactory().one('pub_user', {
                where: {
                  code: ctx.request.body.code,
                  password_hash: password,
                  status: 1
                },
                select: 'code name stop_flag type roles tenantId'
              })

              if (user) {
                if (user.stop_flag) {
                  ctx.body = responser.error({message: '该用户已停用!'})
                  await next
                  return
                }
                let tenant, open_funcs
                // console.log('user:', user.type, DIC.PUB06.TENANT)
                if (user.type === DIC.PUB06.TENANT) {
                  // 普通租户
                  tenant = await mongoFactory().one('pub_tenant', {
                    where: {
                      _id: user.tenantId
                    },
                    select: '_id name type active_flag certificate_flag validate_util limit_to open_funcs'
                  })

                  // 检查租户是否激活open_funcs
                  if (!tenant.active_flag) {
                    ctx.body = responser.error({message: `该用户所属的【${tenant.name}】未激活!`})
                    await next
                    return
                  }

                  // 检查租户是否到期
                  if (moment(tenant.validate_util).diff(moment()) < 0) {
                    // 用户所属租户到期
                    ctx.body = responser.error({message: `该用户所属的【${tenant.name}】已经超过使用有效期!`})
                    await next
                    return
                  }

                  // 考虑cookie大小，过滤open_funcs里的字段
                  tenant = tenant.toObject() // 将bson转为json
                  open_funcs = tenant.open_funcs.map(o => utils.pick(o, 'func_id', 'expired_on'))
                  delete tenant.open_funcs
                }

                user = utils.pick(user.toObject(), '_id', 'code', 'name', 'type', 'roles')
                user.tenant = tenant

                // 日期字符 保证token当日有效
                // sign with default (HMAC SHA256)
                let token = jwt.sign(user, app.conf.secure.authSecret + ':' + moment().format('YYYY-MM-DD'))

                // console.log(token)

                ctx.body = responser.ret({user: user, token: token, open_funcs: open_funcs || []})
              } else {
                ctx.body = responser.error({message: '无效的的登录名密码!'})
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
