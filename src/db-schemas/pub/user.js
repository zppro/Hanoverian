/**
 * Created by zppro on 17-7-14.
 * pub 用户实体
 */
var mongoose = require('mongoose');
import DICT from '../../pre-defined/dictionary.json';

const D1000 = DICT["D1000"];

const userSchema = new mongoose.Schema({
    check_in_time: {type: Date, default: Date.now},
    operated_on: {type: Date, default: Date.now},
    status: {type: Number, min: 0, max: 1, default: 1},
    code: {type: String, required: true, maxlength: 30, index: {unique: true}},
    name: {type: String, required: true, maxlength: 30},
    phone: {type: String, maxlength: 20, unique: true, index: true},
    type: {type: String, enum: Object.keys(D1000).slice(1)},
    roles: [String],
    system_flag: {type: Boolean, default: false},
    stop_flag: {type: Boolean, default: false},//开通标志 租户是否可用
    password_hash: String,
    tenantId: {type: mongoose.Schema.Types.ObjectId, required: true,ref:'pub_tenant'}
});

userSchema.pre('update', function (next) {
    this.update({}, {$set: {operated_on: new Date()}});
    next();
});

userSchema.pre('save', function (next) {
    console.log('password_hash:');
    if (!this.password_hash) {
        //设置默认密码
        //order.type+[年2月2日2]+6位随机数
        this.password_hash = ctx.crypto.createHash('md5').update('123456').digest('hex');
    }
    next();
});

export default userSchema;
