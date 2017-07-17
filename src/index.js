/**
 * index Created by zppro on 17-7-12.
 * Target:入口
 */
import path from 'path';
import fs from 'fs-extra';
import log4js from 'log4js';
import yargs from 'yargs';
import Koa from 'koa';
import Router from 'koa-router';
import KoaBody from 'koa-body';
import XmlBodyParser from 'koa-xml-body';

import utils, { logger, mongoManager, mongoFactory } from 'cube-brick';


const app = new Koa();
const router = new Router();
const koaBody = KoaBody();
const xmlBodyParser = XmlBodyParser();

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
        apis: path.join(__dirname, 'apis'), //apis
        db_schemas: path.join(__dirname, 'db-schemas'),
        components: path.join(__dirname, 'components')
    },
    bodyParser: {
        xml: [] //body需要xml解析
    },
    port: 9999,
    ...yargs.argv
};

(async ()=>{

    //配置数据库
    console.log(`configure mongodb ...`);
    mongoManager.init(app);
    mongoManager.connectDB();

    console.log(`load models...`);
    await mongoManager.loadModels(app.conf.dir.db_schemas);

    logger.d(`parse apis ...`);
    let apiFiles = await utils.readDirectoryStructure(app.conf.dir.apis, { format: 'array', exts: '.js', excludeDirs: ['node_modules', '.git']});
    if(apiFiles.length > 0){
        logger.d(`process apis ...`);

        logger.d(`configure logs for apis...`);
        let logCatagories = {};
        let configAppenders = {out: { type: 'stdout' }};
        apiFiles.reduce((result, o) => {
            result[o.name] =  {
                type: 'file',
                filename: path.join(app.conf.dir.log, o.relative_path.split('/').join('_') + '.log'),
                maxLogSize: 2 * 1024 * 1024, //2M
                backups: 5
            };
            logCatagories[o.name] = { appenders: ['out', o.name], level: 'debug' };
            return result;
        }, configAppenders);

        log4js.configure({
            appenders: configAppenders,
            categories: {
                ...logCatagories,
                default: {appenders: ['out'], level: 'debug'}
            }
        });

        let apis = await Promise.all(apiFiles.map(async o => await import(`${app.conf.dir.apis}/${o.relative_path2}`).then(svc => {
                return {svc: svc.default, props: o}
            }
        )));
        // console.log(`apis:`, apis);

        logger.d(`register routers for apis...`)
        apis.forEach(api => {
            let svc = api.svc;
            let svc_module_name = api.props.name;
            if (svc_module_name.includes('_')) {
                svc_module_name = svc_module_name.split('_').join('/');
            }
            let routerUrl = `/${api.props.relative_path}`.substr(0, api.props.relative_path.indexOf('.') + 1);
            svc.init(routerUrl, {log_name: `${api.props.name}`});
            svc.actions.forEach(action => {
                let bodyParser;
                if (app.conf.bodyParser.xml.findIndex(a => action.url.startsWith(a)) == -1) {
                    bodyParser = koaBody;
                    // logger.d('jsonBodyParser use to ' + action.url);
                } else {
                    bodyParser = xmlBodyParser({
                        encoding: 'utf8',
                        onerror: (err, ctx) => {
                            logger.e(err);
                        }
                    });
                    logger.d('xmlBodyParser use to ' + action.url);
                }
                router[action.verb](`${routerUrl}_${action.method}`, action.url, bodyParser, action.handler(app));
            });
        });
    }

    app.use(router.routes()).use(router.allowedMethods());

    const svr = app.listen(app.conf.port);
    // app.listen(app.conf.port);

    // svr.listen(app.conf.port);

    logger.d(`listen ${app.conf.port}...`);

})();
