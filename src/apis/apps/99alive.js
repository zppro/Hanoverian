/**
 * Created by zppro on 17-7-31.
 */

import log4js from 'log4js'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import utils, { responser } from 'cube-brick'

import keys from '../../pre-defined/keys.json'

const service = {
  init: function (routerUrl, {ctx, log_name}) {
    let self = this
    this.routerUrl = routerUrl.split('_').join('/')
    this.logger4js = log4js.getLogger(log_name)
    this.logger4js.info(`${__filename} loaded!`)

    this.actions = [
      {
        method: 'apiTokenBySSR',
        verb: 'get',
        url: `${self.routerUrl}/apiTokenBySSR`,
        handler: app => {
          return async (ctx, next) => {
            try {

              if (Boolean(ctx.get('ssr')) === false) {
                ctx.body = responser.error({message: '无效的参数1!'})
                await next
                return
              }

              const api_token_ts = +new Date()
              let payload = '99alive-api-key'
              let signed = `99alive:${moment().format('YYYY-MM-DD')}:${api_token_ts}`
              let apiToken = jwt.sign(payload, signed)

              // console.log('cookie token:', ctx.cookies.get('token'), {path:'/', httpOnly: false, overwrite: true})
              ctx.body = responser.ret({apiToken, ts: api_token_ts})
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$stats',
        verb: 'get',
        url: `${self.routerUrl}/tpa/stats`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.ret({tpaNumbers: 88})
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$slidersInIndex',
        verb: 'get',
        url: `${self.routerUrl}/tpa/slidersInIndex`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: 'slider1', img: 'https://img2.okertrip.com/99alive-alpha/1.png'},
                {id: 'slider2', img: 'https://img2.okertrip.com/99alive-alpha/2.png'},
                {id: 'slider3', img: 'https://img2.okertrip.com/99alive-alpha/3.jpg'},
                {id: 'slider4', img: 'https://img2.okertrip.com/99alive-alpha/1.png'}
              ])
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$tabsInIndex',
        verb: 'get',
        url: `${self.routerUrl}/tpa/tabsInIndex`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: 'recommended', name: '为您推荐', data: keys.LAZY_LOAD},
                {id: 'recently', name: '最近加入', data: keys.LAZY_LOAD},
                {id: 'remote', name: '异地养老', data: keys.LAZY_LOAD}
              ])
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$recommendedAgenciesInIndex',
        verb: 'get',
        url: `${self.routerUrl}/tpa/recommendedAgenciesInIndex`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: '11', name: '北京光大汇晨朝来老年公寓11', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '12', name: '北京光大汇晨朝来老年公寓12', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '13', name: '北京光大汇晨朝来老年公寓13', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '14', name: '北京光大汇晨朝来老年公寓14', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '15', name: '北京光大汇晨朝来老年公寓15', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '16', name: '北京光大汇晨朝来老年公寓16', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '17', name: '北京光大汇晨朝来老年公寓17', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '18', name: '北京光大汇晨朝来老年公寓18', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '19', name: '北京光大汇晨朝来老年公寓19', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450}
              ])
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$recentlyAgenciesInIndex',
        verb: 'get',
        url: `${self.routerUrl}/tpa/recentlyAgenciesInIndex`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: '21', name: '北京光大汇晨朝来老年公寓21', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '22', name: '北京光大汇晨朝来老年公寓22', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '23', name: '北京光大汇晨朝来老年公寓23', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '24', name: '北京光大汇晨朝来老年公寓24', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '25', name: '北京光大汇晨朝来老年公寓25', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '26', name: '北京光大汇晨朝来老年公寓26', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '27', name: '北京光大汇晨朝来老年公寓27', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '28', name: '北京光大汇晨朝来老年公寓28', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '29', name: '北京光大汇晨朝来老年公寓29', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450}
              ])
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$remoteAgenciesInIndex',
        verb: 'get',
        url: `${self.routerUrl}/tpa/remoteAgenciesInIndex`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: '31', name: '北京光大汇晨朝来老年公寓31', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '32', name: '北京光大汇晨朝来老年公寓32', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '33', name: '北京光大汇晨朝来老年公寓33', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '34', name: '北京光大汇晨朝来老年公寓34', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '35', name: '北京光大汇晨朝来老年公寓35', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '36', name: '北京光大汇晨朝来老年公寓36', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '37', name: '北京光大汇晨朝来老年公寓37', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '38', name: '北京光大汇晨朝来老年公寓38', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '39', name: '北京光大汇晨朝来老年公寓39', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450}
              ])
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$agenciesInQuery',
        verb: 'get',
        url: `${self.routerUrl}/tpa/agenciesInQuery`,
        handler: app => {
          return async (ctx, next) => {
            try {
              ctx.body = responser.rows([
                {id: '31', name: '北京光大汇晨朝来老年公寓31', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '32', name: '北京光大汇晨朝来老年公寓32', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '33', name: '北京光大汇晨朝来老年公寓33', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '34', name: '北京光大汇晨朝来老年公寓34', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '35', name: '北京光大汇晨朝来老年公寓35', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '36', name: '北京光大汇晨朝来老年公寓36', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '37', name: '北京光大汇晨朝来老年公寓37', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '38', name: '北京光大汇晨朝来老年公寓38', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450},
                {id: '39', name: '北京光大汇晨朝来老年公寓39', img:'https://img2.okertrip.com/99alive-alpha/3.jpg', charge_interval: '1500-6000', bed_nums: 450}
              ])
            } catch (e) {
              self.logger4js.error(e.message)
              ctx.body = responser.error(e)
            }
            await next
          }
        }
      },
      {
        method: 'tpa$agencyInDetails',
        verb: 'get',
        url: `${self.routerUrl}/tpa/agencyInDetails/:id`,
        handler: app => {
          return async (ctx, next) => {
            try {
              const id = ctx.params.id
              ctx.body = responser.ret( {
                id,
                imgs: [
                  'https://img2.okertrip.com/99alive-alpha/1.png',
                  'https://img2.okertrip.com/99alive-alpha/2.png',
                  'https://img2.okertrip.com/99alive-alpha/3.jpg',
                  'https://img2.okertrip.com/99alive-alpha/1.png',
                  'https://img2.okertrip.com/99alive-alpha/2.png',
                  'https://img2.okertrip.com/99alive-alpha/3.jpg'
                ],
                name: `杭州市社会福利中心-${id}`,
                address: '杭州市拱墅区和睦路451号',
                area: '浙江省-杭州市-拱墅区',
                nature: '公办',
                type: '老年社会福利院', // /护老院/护养院/敬老院/托老所/老年人服务中心
                service_object: '自理/介助/介护',
                publish_on: '1999年11月',
                fee_range: '2000以下', // /4000-4999/5000-7999/8000-9999/1万以上
                bed_num_range: '200-499', // /200-499/500以上
                star_rank: '五星级', // /四星级/五星级
                link_man: '张XX',
                link_phone: '13XXXXXXX123',
                intro: '介绍...',
                link_info: '联系方式...',
                reputation: 'LAZY_LOAD'
              })
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
