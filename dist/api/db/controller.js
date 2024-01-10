"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuth = exports.updateAuth = exports.checkAuth = exports.getAuth = exports.createAuth = exports.deleteStoreKey = exports.updateStoreKey = exports.createStoreKey = exports.getStoreApp = exports.getStoreKey = exports.getStores = exports.createApp = exports.getApp = exports.getApps = exports.testDb = exports.readDb = void 0;
const postgres_1 = require("@vercel/postgres");
const tools_1 = require("../../tools");
/*
import { createKysely } from "@vercel/postgres-kysely";
const myDb = createKysely();
 */
/* For debug only
import { postgresConnectionString} from "@vercel/postgres";
const pooledConnectionString = postgresConnectionString('pool');
const directConnectionString = postgresConnectionString('direct');
console.log("Pool",pooledConnectionString);
console.log("Direct",directConnectionString);
*/
const readDb = async (db, id, email, page, pageSize) => {
    const offset = (+page - 1) * +pageSize;
    const dbName = db.toUpperCase();
    if (id) {
        let count = await (0, postgres_1.sql) `SELECT count(*) FROM cards WHERE id=${id};`;
        let { rows } = await (0, postgres_1.sql) `SELECT * FROM cards WHERE id=${id}`;
        return { totalCount: count.rows[0].count, rows: rows };
    }
    else if (email) {
        // email = "%" + email;
        let count = await (0, postgres_1.sql) `SELECT count(*) FROM cards WHERE email=${email};`;
        let { rows } = await (0, postgres_1.sql) `SELECT * FROM cards WHERE email=${email} LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, email: email, page: page, pageSize: pageSize, rows: rows };
    }
    else {
        let count = await (0, postgres_1.sql) `SELECT count(*) FROM cards;`;
        let { rows } = await (0, postgres_1.sql) `SELECT * FROM cards LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, page: page, pageSize: pageSize, rows: rows };
    }
};
exports.readDb = readDb;
const testDb = async () => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT 1`;
    return ret;
};
exports.testDb = testDb;
// Table APPS
const getApps = async () => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from apps`;
    return ret.rows;
};
exports.getApps = getApps;
const getApp = async (app) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from apps WHERE app=${app}`;
    return ret.rows;
};
exports.getApp = getApp;
const createApp = async (app, email) => {
    const client = await postgres_1.db.connect();
    const uid = (0, tools_1.genUniqueId)();
    const ret = await client.sql `INSERT INTO public.apps (uid,app,email) VALUES (${uid},${app},${email})`;
    if (ret.rowCount == 1) {
        return { api: "createApp", status: "created", email: email, app: app, uid: uid };
    }
    else {
        return ret;
    }
};
exports.createApp = createApp;
// Table store
const getStores = async () => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from store`;
    return ret.rows;
};
exports.getStores = getStores;
const getStoreKey = async (uid, key) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from store WHERE uid=${uid} AND keystore=${key}`;
    return ret.rows[0].data;
};
exports.getStoreKey = getStoreKey;
const getStoreApp = async (uid) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from store WHERE uid=${uid}`;
    return ret.rows;
};
exports.getStoreApp = getStoreApp;
const createStoreKey = async (uid, key, value) => {
    const client = await postgres_1.db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql `INSERT INTO public.store (uid,keystore,data) VALUES (${uid},${key},${data})`;
    if (ret.rowCount == 1) {
        return { api: "createStoreKey", status: "created", uid: uid, key: key, data: data };
    }
    else {
        return ret;
    }
};
exports.createStoreKey = createStoreKey;
const updateStoreKey = async (uid, key, value) => {
    const client = await postgres_1.db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql `UPDATE public.store SET data=${data} WHERE uid=${uid} AND keystore=${key}`;
    if (ret.rowCount == 1) {
        return { api: "updateStoreKey", status: "updated", uid: uid, key: key, data: data };
    }
    else {
        return ret;
    }
};
exports.updateStoreKey = updateStoreKey;
const deleteStoreKey = async (uid, key) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `DELETE FROM public.store WHERE uid=${uid} AND keystore=${key}`;
    if (ret.rowCount == 1) {
        return { api: "deleteStoreKey", status: "deleted", uid: uid, key: key };
    }
    else {
        return ret;
    }
};
exports.deleteStoreKey = deleteStoreKey;
// Table auth
const createAuth = async (name, email, password, secret) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `INSERT INTO public.auth (name,email,password,secret) VALUES (${name},${email},${password},${secret})`;
    if (ret.rowCount == 1) {
        return { api: "createAuth", status: "created", uid: 'aa' };
    }
    else {
        return ret;
    }
};
exports.createAuth = createAuth;
const getAuth = async (email) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.auth where email=${email}`;
    return ret;
};
exports.getAuth = getAuth;
const checkAuth = async (email) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.auth where email=${email}`;
    if (ret.rowCount === 1) {
        return { rowCount: ret.rowCount, data: ret.rows[0] };
    }
    else {
        return { rowCount: ret.rowCount };
    }
};
exports.checkAuth = checkAuth;
const updateAuth = async (uid, key, value) => {
    const client = await postgres_1.db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql `UPDATE public.store SET data=${data} WHERE uid=${uid} AND keystore=${key}`;
    if (ret.rowCount == 1) {
        return { api: "updateStoreKey", status: "updated", uid: uid, key: key, data: data };
    }
    else {
        return ret;
    }
};
exports.updateAuth = updateAuth;
const deleteAuth = async (id) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `DELETE FROM public.auth WHERE id=${id}`;
    if (ret.rowCount == 1) {
        return { api: "deleteAuth", status: "deleted", id: id };
    }
    else {
        return ret;
    }
};
exports.deleteAuth = deleteAuth;
//# sourceMappingURL=controller.js.map