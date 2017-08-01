/**
 * Created by zppro on 17-8-1.
 */
const whitelist = require('../pre-defined/cors-whitelist.json');
module.exports = () => {
  var re = /http(s)?:\/\/192\.168\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]):?[0-9]*/gi;//内网地址
  return async (ctx, next) => {
    console.log('----------------------------')
    console.log('crossDomain:', ctx.request);
    const origin = (ctx.request.headers['origin'] || '').toLowerCase();

    let patched = whitelist.includes(origin) || origin.match(re);
    if (patched) {
      ctx.set('Access-Control-Allow-Origin', origin);
      ctx.set('Access-Control-Allow-Credentials', 'true');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With,Origin,Access-Control-Allow-Origin,X-Custom-TS');
      ctx.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
      console.log(ctx.response, next);
    }
    else{
      console.log('not set CORS header')
    }
    await next()
  }
}