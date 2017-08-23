/**
 * index Created by zppro on 17-7-12.
 * Target:入口
 */
import path from 'path'
// import fs from 'fs-extra'
import log4js from 'log4js'
import yargs from 'yargs'
import Koa from 'koa'
import Router from 'koa-router'
import KoaBody from 'koa-body'
import XmlBodyParser from 'koa-xml-body'
import session from 'koa-session'
// import mongoose from 'mongoose'

// import utils, { logger, mongoManager, mongoFactory } from 'cube-brick'
import utils, { koaCORS, logger, mongoManager } from 'cube-brick'

import corsWhitelist from './pre-defined/cors-whitelist.json'

const app = new Koa()
const router = new Router()
const koaBody = KoaBody()
const xmlBodyParser = XmlBodyParser()

// --client.bulidtarget=vendor-1.x
// --db.mongodb.user=4gtour
// --db.mongodb.password=4gtour2016
// --db.mongodb.server=localhost
// --db.mongodb.port=27017
// --db.mongodb.database=4gtour
// --secure.authSecret=woosiyuan
// --secure.authSecretRobot=woosiyuan-robot-pension-agency
// --secure.authSecretWXApp=woosiyuan-wxapp-general
// --port=3002

app.conf = {
  isProduction: utils.isProduction(),
  dir: {
    root: __dirname,
    log: path.join(__dirname, '../logs'),
    apis: path.join(__dirname, 'apis'), // apis
    db_schemas: path.join(__dirname, 'db-schemas'),
    components: path.join(__dirname, 'components')
  },
  bodyParser: {
    xml: [] // body需要xml解析
  },
  cors:{
    toPaths: ['/apis']
  },
  session: {
    key: 'hanoverian:sess'
  },
  port: 9999,
  ...yargs.argv
}
;(async () => {
  // 配置数据库
  logger.d(`configure mongodb ...`)
  logger.d(`parse apis ...`)
  mongoManager.init(app)
  mongoManager.connectDB()

  logger.d(`load models...`)
  await mongoManager.loadModels(app.conf.dir.db_schemas)

  //session-cookie
  app.keys = [app.conf.secure.authSecret]
  logger.d(`configure middleware session...`)
  app.sessionUtil = Object.assign({}, app.conf.session)
  router.use(session(app.sessionUtil, app))
  // console.log(sessionOptions, app.sessionUtil)

  //中间件
  logger.d(`configure middleware CORS...`)
  const cors = koaCORS(corsWhitelist, {ignorePaths: app.conf.cors.ignorePaths, logger})
  app.conf.cors.toPaths.forEach(o => {
    router.use(o, cors)
  })

  logger.d(`parse apis && components...`)
  let apiFiles = await utils.readDirectoryStructure(app.conf.dir.apis, {
    format: 'array',
    exts: '.js',
    excludeDirs: ['node_modules', '.git']
  })
  let componentFiles = await utils.readDirectoryStructure(app.conf.dir.components, {
    format: 'array',
    exts: '.js',
    excludeDirs: ['node_modules', '.git']
  })
  if (apiFiles.length > 0) {
    logger.d(`process apis ...`)

    logger.d(`configure logs for apis...`)
    let logCatagories = {}
    let configAppenders = {out: {type: 'stdout'}}
    apiFiles.reduce((result, o) => {
      result[o.name] = {
        type: 'file',
        filename: path.join(app.conf.dir.log, o.relative_path.split('/').join('_') + '.log'),
        maxLogSize: 2 * 1024 * 1024,
        backups: 5
      }
      logCatagories[o.name] = {appenders: ['out', o.name], level: 'debug'}
      return result
    }, configAppenders)
    componentFiles.reduce((result, o) => {
      result[o.name] = {
        type: 'file',
        filename: path.join(app.conf.dir.log, o.relative_path.split('/').join('_') + '.log'),
        maxLogSize: 2 * 1024 * 1024,
        backups: 5
      }
      logCatagories[o.name] = {appenders: ['out', o.name], level: 'debug'}
      return result
    }, configAppenders)

    log4js.configure({
      appenders: configAppenders,
      categories: {
        ...logCatagories,
        default: {appenders: ['out'], level: 'debug'}
      }
    })

    let apis = await Promise.all(apiFiles.map(o => {
      const m = import(`${app.conf.dir.apis}/${o.relative_path2}`).then(svc => {
        return {svc: svc.default, props: o}
      })
      return m
    }))

    logger.d(`register routers for apis...`)
    apis.forEach(async api => {
      let svc = api.svc
      let svc_module_name = api.props.name
      if (svc_module_name.includes('_')) {
        svc_module_name = svc_module_name.split('_').join('/')
      }
      let routerUrl = `/${api.props.relative_path}`.substr(0, api.props.relative_path.indexOf('.') + 1)
      await svc.init(routerUrl, {ctx: app, log_name: `${api.props.name}`})
      svc.actions.forEach(action => {
        let bodyParser
        if (app.conf.bodyParser.xml.findIndex(a => action.url.startsWith(a)) === -1) {
          bodyParser = koaBody
          // logger.d('jsonBodyParser use to ' + action.url);
        } else {
          bodyParser = xmlBodyParser({
            encoding: 'utf8',
            onerror: (err, ctx) => { logger.e(err) }
          })
          logger.d('xmlBodyParser use to ' + action.url)
        }
        router[action.verb](`${routerUrl}_${action.method}`, action.url, bodyParser, action.handler(app))
      })
    })

    logger.d(`init components...`)
    componentFiles.forEach(async o => {
      app['coms'] = {}
      await import(`${app.conf.dir.components}/${o.relative_path2}`).then(svc => {
        app.coms[o.relative_name] = svc.default.init(app, {log_name: `${o.name}`})
      })
    })
  }

  app.use(router.routes()).use(router.allowedMethods())

  app.listen(app.conf.port)
  // const svr = app.listen(app.conf.port);
  // svr.listen(app.conf.port);

  logger.d(`listen ${app.conf.port}...`)
})()
