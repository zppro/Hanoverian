/**
 * Created by zppro on 17-7-14.
 * pub 用户实体
 */

import mongoose from 'mongoose'
import md5 from 'crypto-js/md5'
import DICT_PUB from '../../pre-defined/dictionary-pub.json'

const PUB06 = DICT_PUB['PUB06']

const userSchema = new mongoose.Schema({
  check_in_time: {type: Date, default: Date.now},
  operated_on: {type: Date, default: Date.now},
  status: {type: Number, min: 0, max: 1, default: 1},
  code: {type: String, required: true, maxlength: 30, index: {unique: true}},
  name: {type: String, required: true, maxlength: 30},
  phone: {type: String, maxlength: 20, unique: true, index: true},
  type: {type: String, enum: Object.keys(PUB06).slice(1)},
  roles: [String],
  system_flag: {type: Boolean, default: false},
  stop_flag: {type: Boolean, default: false}, // 开通标志 租户是否可用
  password_hash: String,
  tenantId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'pub_tenant'}
})

userSchema.pre('update', function (next) {
  this.update({}, {$set: {operated_on: new Date()}})
  next()
})

userSchema.pre('save', function (next) {
  // console.log('password_hash:')
  if (!this.password_hash) {
    // 设置默认密码
    // order.type+[年2月2日2]+6位随机数
    this.password_hash = md5('123456').toString()
  }
  next()
})

export default userSchema
