/**
 * Created by zppro on 17-7-17.
 *
 * Hanoverian 管理中心 租户实体
 *
 * Author: @zppro
 * Website: https://github.com/zppro
 * License: GPL-2.0
 */

import mongoose from 'mongoose'
import DICT_PUB from '../../pre-defined/dictionary-pub.json'

const PUB08 = DICT_PUB['PUB08']
const PUB12 = DICT_PUB['PUB12']

const tenantSchema = new mongoose.Schema({
  check_in_time: {type: Date, default: Date.now},
  operated_on: {type: Date, default: Date.now},
  status: {type: Number, min: 0, max: 1, default: 1},
  name: {type: String, required: true, maxlength: 30},
  phone: {type: String, maxlength: 20, unique: true, index: true},
  email: {type: String, maxlength: 30, unique: true, index: true},
  type: {type: String, enum: Object.keys(PUB08).slice(1)},
  active_flag: {type: Boolean, default: false}, // 开通标志 租户是否可用
  certificate_flag: {type: Boolean, default: false}, // 认证标志 是否式正式租户
  token: {type: String, required: true, minlength: 8, maxlength: 8}, // 租户标识(8位)
  token_expired: {type: Date}, // 租户标识过期时间
  validate_util: {type: Date, required: true},
  limit_to: {type: Number, min: 0, default: 0}, // 0不限发布产品数量
  // 定价模块
  price_funcs: [{
    check_in_time: {type: Date, default: Date.now}, // 最新定价时间
    func_id: {type: String, required: true},
    func_name: {type: String, required: true},
    subsystem_id: {type: String, required: true},
    subsystem_name: {type: String, required: true},
    price: {type: Number, default: 0.00}, // 期间收费价格
    orderNo: {type: Number, default: 0} // 排序序号
  }],
  // 开通模块（通过订单）
  open_funcs: [{
    check_in_time: {type: Date, default: Date.now}, // 开通时间
    func_id: {type: String, required: true},
    func_name: {type: String, required: true},
    subsystem_id: {type: String, required: true},
    subsystem_name: {type: String, required: true},
    charge: {type: Number, default: 0.00}, // 月费
    orderNo: {type: Number, default: 0}, // 排序序号
    // payed: {type: Boolean, default: false},
    expired_on: {type: Date, default: Date.now}
  }],
  charge_standards: [{
    charge_standard: {type: String, required: true},
    subsystem: {type: String, required: true},
    charge_items: [{
      check_in_time: {type: Date, default: Date.now},
      item_id: {type: String, required: true},
      item_name: {type: String, required: true},
      period_price: {type: Number, default: 0.00},
      period: {type: String, required: true, minlength: 5, maxlength: 5, enum: Object.keys(PUB12).slice(1)},
      orderNo: {type: Number, default: 0}
    }]
  }],
  general_ledger: {type: Number, default: 0.00}, // 一般在通过流水月结转
  subsidiary_ledger: {
    self: {type: Number, default: 0.00}, // 主账户
    other: {type: Number, default: 0.00} // 其他账户
  },
  head_of_agency: {
    name: {type: String}, // 机构负责人姓名
    phone: {type: String} // 机构负责人电话
  }
})

tenantSchema.pre('update', function (next) {
  this.update({}, {$set: {operated_on: new Date()}})
  next()
})

tenantSchema.$$skipPaths = ['price_funcs', 'open_funcs', 'charge_standards', 'charge_items', 'subsidiary_ledger']

export default tenantSchema
