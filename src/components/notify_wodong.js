/**
 * Created by zppro on 17-8-14.
 */
import log4js from 'log4js'
import utils, { responser } from 'cube-brick'
import wodongConfig from '../confs/wodong-config.json'
import rp from 'request-promise-native'

export default {
  init: function (ctx, initOptions = {}) {
    this.ctx = ctx
    this.logger4js = log4js.getLogger(initOptions.log_name)
    this.logger4js.info(`${__filename} loaded!`)

    // let isProduction = ctx.conf.isProduction;
    let isProduction = true;//使用正式接口
    this.vmsUrl = isProduction ? wodongConfig.production.host + wodongConfig.production.vms : wodongConfig.develop.host + wodongConfig.develop.vms
    this.smsUrl = isProduction ? wodongConfig.production.host + wodongConfig.production.sms : wodongConfig.develop.host + wodongConfig.develop.sms
    this.shared_form = isProduction ? wodongConfig.production.shared_form: wodongConfig.develop.shared_form
    return this
  },
  _parseMobiles (mobiles) {
    let mobile = '', raw_mobiles = ''
    if (Array.isArray(mobiles)) {
      raw_mobiles = mobiles.join()
      mobiles = mobiles.filter(o => utils.isPhone(o))
      mobile = mobiles.join()
    } else if (utils.isString(mobiles)) {
      raw_mobiles = mobiles
      if(utils.isPhone(raw_mobiles)){
        mobile = mobiles
      }
    }

    return mobile
  },
  vms: async function (mobiles, title, sendContent) {
    try {

      let mobile  = this._parseMobiles(mobiles)
      if(!mobile){
        return responser.error({message: `无效的号码:${mobiles}` })
      }

      const formData = Object.assign({
        mobile: mobile,
        title: title,
        Vmsmsg: sendContent
      }, this.shared_form)

      const sendRet = await rp({
        method: 'POST',
        url: this.vmsUrl,
        form: formData,
        json: true
      })
      console.log('---------------- vms sendRet', this.vmsUrl, formData.mobile, sendRet)
      return responser.ret({url: this.vmsUrl, formData: formData, result: sendRet})
    }
    catch (e) {
      console.log(e)
      this.logger.error(e.message)
      return responser.error(e);
    }
  },
  sms: async function (mobiles, sendContent) {
    try {
      let mobile  = this._parseMobiles(mobiles)
      if(!mobile){
        return responser.error({message: `无效的号码:${mobiles}` })
      }

      const formData = Object.assign({
        mobile: mobile,
        content: sendContent
      }, this.shared_form)

      const sendRet = await rp({
        method: 'POST',
        url: this.smsUrl,
        form: formData,
        json: true
      })
      console.log('---------------- sms sendRet', this.smsUrl, formData.mobile, sendRet)
      return responser.ret({url: this.smsUrl, formData: formData, result: sendRet})
    }
    catch (e) {
      console.log(e);
      this.logger.error(e.message);
      return responser.error(e);
    }
  }
}