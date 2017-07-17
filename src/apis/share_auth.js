/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js';
import md5 from 'crypto-js/md5';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import utils, { responser, mongoFactory } from 'cube-brick';

import DIC from '../pre-defined/dictionary-constants.json';


const shareModel = {
    init: function (routerUrl, initOptions) {

        this.routerUrl = routerUrl.split('_').join('/');
        initOptions = initOptions || {};

        let self = this;

        this.logger4js =  log4js.getLogger(initOptions.log_name);
        this.logger4js.info(__filename + " loaded!");

        this.actions = [
            {
                method: 'fetch-district',
                verb: 'get',
                url: self.routerUrl + "/district",
                handler: (app) => {
                    return async (ctx, next) => {
                        try {
                            let district = await import('../pre-defined/district.json');
                            ctx.body = responser.rows(district);
                        } catch (e) {
                            self.logger4js.error(e.message);
                            ctx.body = responser.error(e);
                        }
                        await next;
                    };
                }
            },
            {
                method: 'signin',
                verb: 'post',
                url: self.routerUrl + "/signin",
                handler: (app) => {
                    return async (ctx, next) => {
                        try {
                            let password = ctx.request.body.password;
                            if (password.length != 32) {
                                password = md5(password).toString();
                            }

                            console.log('body:', ctx.request.body.code, password);
                            let user = (await mongoFactory().one('pub_user', {
                                where: {
                                    code: ctx.request.body.code,
                                    password_hash: password,
                                    status: 1
                                }, select: "code name stop_flag type roles tenantId"
                            }));

                            if (user) {
                                for(let k in user) {
                                    console.log('for:', k, user[k]);
                                }
                                if (user.stop_flag) {
                                    ctx.body = responser.error({message: '该用户已停用!'});
                                    await next;
                                    return;
                                }
                                let tenant, open_funcs;
                                console.log('user:', typeof user, user, user.code, DIC.PUB06.TENANT);
                                if (user.type === DIC.PUB06.TENANT) {
                                    //普通租户
                                    tenant = await mongoFactory().one('pub_tenant', {
                                        where: {
                                            _id: user.tenantId
                                        },
                                        select: "_id name type active_flag certificate_flag validate_util limit_to open_funcs"
                                    });

                                    //检查租户是否激活open_funcs
                                    if (!tenant.active_flag) {
                                        ctx.body = responser.error({message: '该用户所属的【' + tenant.name + '】未激活!'});
                                        await next;
                                        return;
                                    }

                                    //检查租户是否到期
                                    if (moment(tenant.validate_util).diff(moment()) < 0) {
                                        //用户所属租户到期
                                        ctx.body = responser.error({message: '该用户所属的【' + tenant.name + '】已经超过使用有效期!'});
                                        await next;
                                        return;
                                    }

                                    //考虑cookie大小，过滤open_funcs里的字段
                                    tenant = tenant.toObject();//将bson转为json
                                    open_funcs = tenant.open_funcs.map(o => utils.pick(o, 'func_id', 'expired_on'))
                                    delete tenant.open_funcs;
                                }

                                user = utils.pick(user.toObject(), '_id', 'code', 'name', 'type', 'roles');
                                user.tenant = tenant;

                                //日期字符 保证token当日有效
                                // sign with default (HMAC SHA256)
                                let token = jwt.sign(user, app.conf.secure.authSecret + ':' + moment().format('YYYY-MM-DD'));

                                console.log(token);

                                ctx.body = responser.ret({user: user, token: token, open_funcs: open_funcs || []});
                            }
                            else {
                                ctx.body = responser.error({message: '无效的的登录名密码!'});
                            }

                        } catch (e) {
                            self.logger4js.error(e.message);
                            ctx.body = responser.error(e);
                        }
                        await next;
                    };
                }
            }
        ];
        return this;
    }
}

export default shareModel;