/**
 * Created by zppro on 17-7-14.
 */

import mongoose from 'mongoose';
import utils from 'cube-brick';

const DEFAULT_DB_NAME = '_default_';

class MongoDatabase {
    constructor(ctx, conn) {
        this.db = conn || mongoose;
        this.ctx = ctx;
    }

    createModel (...args) {
        this.db.model.apply(this.db, args);
    }

    _ensureModel (model) {
        return utils.isString(model) ? this.db.model(model) : model;
    }

    create(model, data) {
        model = this._ensureModel(model);
        return model.create(new model(data));
    }

    read(model, id) {
        model = this._ensureModel(model);
        return model.findById(id);
    }

    update(model, id, data) {
        model = this._ensureModel(model);
        return model.update({_id: id}, {$set: data});
    }

    delete(model, id) {
        model = this._ensureModel(model);
        return model.remove({_id: id});
    }

    remove(model, data) {
        if (Object.keys(data).length > 0) {
            model = this._ensureModel(model);
            return model.remove(data);
        } else {
            throw new Error('cant remove whole');
        }
    }

    query(model, data, options) {
        let rows;
        model = this._ensureModel(model);
        if (data) {
            options = options || {};
            if (data.page && data.page.size) {
                !options.limit && (options.limit = data.page.size)
            }
            if (data.page && data.page.no) {
                !options.skip && (options.skip = (data.page.no - 1) * data.page.size);
            }

            //此处因为mongodb不允许[挑选]、[排除]字段同时存在（_id）不受限
            if (!data.select && model.schema.$$skipPaths) {
                data.select = model.schema.$$skipPaths.map(o => '-' + o).join(' ');
            }

            if (data.sort) {
                rows = model.find(data.where, data.select, options).sort(data.sort);
            }
            else {
                rows = model.find(data.where, data.select, options);
            }
        }
        else {
            rows = model.find();
        }

        return rows;
    }

    one(model, data) {
        model = this._ensureModel(model);
        if (data) {
            return model.findOne(data.where, data.select, data.options);
        }
        else {
            return model.findOne();
        }
    }

    bulkInsert(model, data) {
        model = this._ensureModel(model);
        let canInsert = true;
        if (data.removeWhere) {
            model.remove(data.removeWhere, function (err) {
                if (err) {
                    canInsert = false;
                    throw err;
                }
            });
        }

        if (canInsert) {
            return model.insertMany(data.rows);
        }
    }

    bulkUpdate(model, data) {
        model = this._ensureModel(model);
        if (data && data.conditions && data.batchModel) {
            return model.update(data.conditions, data.batchModel, {multi: true});
        }
        return {error: {code: 'E59999', message: 'params error'}}
    }

    //非常危险，防止误删除
    bulkDelete(model, where) {
        model = this._ensureModel(model);
        where = where || {__forbidden_delete__: true};
        return model.remove(where);
    }


    distinct(model, data) {
        model = this._ensureModel(model);
        return model.distinct(data.select, data.where);
    }

    aggregate(model, pipes) {
        model = this._ensureModel(model);
        return model.aggregate(pipes);
    }
}

export const DBManager = {
    dbs: {},
    models: {},
    length: 0,
    init: ctx => {
        mongoose.Promise = global.Promise;
        DBManager.ctx = ctx;
    },
    getDB: db_name => DBManager.dbs[db_name],
    connectDB: (db_name = DEFAULT_DB_NAME, options) => {
        let db = DBManager.dbs[db_name];
        if (!db) {
            let dbConnectConfig = db_name === DEFAULT_DB_NAME ? DBManager.ctx.conf.db.mongodb : options;
            let uri = `mongodb://${dbConnectConfig.user}:${dbConnectConfig.password}@${dbConnectConfig.server}:${dbConnectConfig.port}/${dbConnectConfig.database}`;
            console.log(`db_name: [${db_name}] => ${uri}`);
            let conn = mongoose.createConnection(uri, {useMongoClient: true});
            db = new MongoDatabase(DBManager.ctx, conn);
            DBManager.dbs[db_name] = db;
            DBManager.length++;
        }
        return db;
    },
    loadModels: async (dir, db_name = DEFAULT_DB_NAME, base_dir = '') => {
        let schemaFiles = await utils.readDirectoryStructure(dir, { format: 'array', exts: '.js'});
        let db = DBManager.getDB(db_name);
        if(!db){
            throw new Error(`dbManager have not connect to db ${db_name}`);
        }
        for(let schemaFile of schemaFiles) {
            console.log('schemaFile:', schemaFile);
            console.log()
            await import('../' + schemaFile.relative_path).then(schema => {
                DBManager.models[schemaFile.relative_name] = db.createModel(schemaFile.relative_name, schema, schemaFile.relative_name);
            });
        }
    }
};

const DBFactory = (db_name = DEFAULT_DB_NAME) => {
    if(!DBManager.ctx) {
        throw new Error(`dbManager not inited`);
    }
    let db = DBManager.getDB(db_name);
    if(!db){
        throw new Error(`dbManager have not connect to db ${db_name}`);
    }
    return db;
};

export default DBFactory;