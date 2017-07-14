/**
 * Created by zppro on 17-7-13.
 */

import log4js from 'log4js';

const qrService = {
    init: function (routerUrl, initOptions) {

        this.routerUrl = routerUrl;
        initOptions = initOptions || {};

        // console.log(`this.routerUrl:${this.routerUrl}`)
        let self = this;

        this.logger4js =  log4js.getLogger(initOptions.log_name || ('svc_' + __filename.substr(__filename.lastIndexOf('/') + 1)));
        this.logger4js.info(__filename + " loaded!");

        this.actions = [
            {
                method: 'qr',
                verb: 'get',
                url: this.routerUrl,
                handler: function (app, options) {
                    return async(ctx, next) => {
                        try {
                            let query = ctx.query;
                            let qrStream = await qrBuilder.getQRStream(query.text, query.ei);
                            ctx.response.type = 'image/png';
                            ctx.body = qrStream;

                        } catch (e) {
                            app.combinedLogger.log(self.logger4js, e);
                            ctx.body = app.wrapper.res.error(e);

                        }
                        await next;
                    };
                }
            },
            {
                method: 'qr',
                verb: 'post',
                url: this.routerUrl,
                handler: function (app, options) {
                    return async(ctx, next) => {
                        try {
                            let body = ctx.request.body;
                            console.log('body:', body);
                            let qrStream = await qrBuilder.getQRStream(body.text, body.ei);
                            ctx.response.type = 'image/png';
                            ctx.body = qrStream;
                        } catch (e) {
                            app.combinedLogger.log(self.logger4js, e);
                            ctx.body = app.wrapper.res.error(e);

                        }
                        await next;
                    };
                }
            }
        ];
        return this;
    }
}

export default qrService;