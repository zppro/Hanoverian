/**
 * Created by zppro on 17-8-28.
 */

import jwt from 'jsonwebtoken'
import utils from 'cube-brick'
export default (payloadKey, { secret, ignorePaths, logger }) => {
  return async (ctx, next) => {
    // console.log('ctx.headers:',ctx.headers)
    let isIgnored = false;
    if(ignorePaths) {
      isIgnored = !!ignorePaths.find((o) => {
        if(utils.isString(o)) {
          return ctx.path.toLowerCase().startsWith(o.toLowerCase().replace(/\$/, '\\$'))
        }
        else if(utils.isObject(o)) {
          return ctx.path.toLowerCase().startsWith(o.path.toLowerCase().replace(/\$/, '\\$'))
            && ctx.method.toLowerCase() == o.method.toLowerCase()
        }
        return false
      })
    }
    console.log('isIgnored:', isIgnored, ctx.path)
    if(!isIgnored){
      if(ctx.method != 'OPTIONS') {
        const timestamp = ctx.get('X-Custom-TS')
        if (payloadKey) {
          // Authorization
          const authorization = ctx.get("Authorization")
          // console.log(token)
          if (!authorization || authorization.indexOf('Bearer ') != 0) {
            ctx.status = 401
            return
          }
          try {
            const token = authorization.substr('Bearer '.length)
            const payload = jwt.verify(token, secret + ':' + timestamp)
            console.log(`auth path ${ctx.path} payload:`, payload)
            ctx[payloadKey] = payload.sub
          } catch (e) {
            console.log(e)
            logger && logger.e(`auth path ${ctx.path} error`, e)
            this.status = 401
            return
          }
        } else {
          // api Token auth
          const apiToken = ctx.get("X-Api-Token")
          console.log('apiToken')
          if (!apiToken) {
            ctx.status = 403
            return
          }

          // console.log(token)
          try {
            const payload = jwt.verify(apiToken, secret + ':' + timestamp)
            console.log(`auth path ${ctx.path} only for verify api invoke from web`)
          } catch (e) {
            console.log(e)
            logger && logger.e(`auth path ${ctx.path} error`, e)
            ctx.status = 403
            return
          }
        }
      }
    }
    await next()
  }
}
