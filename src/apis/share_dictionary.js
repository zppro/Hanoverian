/**
 * Created by zppro on 17-7-17.
 */

import log4js from 'log4js';
import { responser } from 'cube-brick';

const shareDictonary = {
    init: function (routerUrl, initOptions) {

        this.routerUrl = routerUrl.split('_').join('/');
        initOptions = initOptions || {};

        let self = this;

        this.logger4js =  log4js.getLogger(initOptions.log_name);
        this.logger4js.info(__filename + " loaded!");

        this.actions = [
            {
                method: 'fetch',
                verb: 'get',
                url: self.routerUrl + "/:dictionaryId/:format",
                handler: (app) => {
                    return async (ctx, next) => {
                        try {
                            let sys = ctx.params.dictionaryId.substr(0,3).toLowerCase();
                            let DICT = await import(`../pre-defined/dictionary-${sys}.json`);
                            let dictionary = DICT[ctx.params.dictionaryId];
                            if (dictionary) {
                                if(ctx.params.format.toLowerCase() === 'array') {
                                    let rows = [];
                                    for (let k in dictionary) {
                                        k !== 'name' && rows.push({...dictionary[k], value: k});
                                    }
                                    ctx.body = responser.rows(rows);
                                }
                                else {
                                    ctx.body = responser.ret(dictionary);
                                }
                            } else {
                                ctx.body = ctx.params.format == 'array' ? [] : {};
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

export default shareDictonary;