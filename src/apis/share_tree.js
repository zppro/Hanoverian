/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js';
import { responser, mongoFactory } from 'cube-brick';

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
                method: 'fetch-model',//针对节点多，且需要服务端过滤
                verb: 'post',
                url: self.routerUrl + "/model/:model",
                handler: (app) => {
                    return async (ctx, next) => {
                        try {
                            let rows = mongoFactory().query(ctx.params.model, ctx.request.body);
                            let populates = ctx.request.body.populates;
                            if (populates) {
                                if (Array.isArray(populates)) {
                                    populates.forEach(p => {rows = rows.populate(p);});
                                } else {
                                    rows = rows.populate(populates);
                                }
                            }
                            ctx.body = responser.rows(await rows);
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