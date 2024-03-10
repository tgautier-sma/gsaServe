"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuth = exports.updateAuth = exports.checkAuth = exports.getAuth = exports.createAuth = exports.deleteStoreId = exports.deleteStoreKey = exports.updateStoreKey = exports.createStoreKey = exports.getStoreApp = exports.getStoreKey = exports.getStores = exports.createApp = exports.getApp = exports.getApps = exports.testDb = exports.readDb = void 0;
const postgres_1 = require("@vercel/postgres");
const utils_1 = require("../../utils");
const readDb = async (db, id, email, page, pageSize) => {
    const offset = (+page - 1) * +pageSize;
    const dbName = db.toUpperCase();
    if (id) {
        let count = await (0, postgres_1.sql) `SELECT count(*) FROM public.cards WHERE id=${id};`;
        let { rows } = await (0, postgres_1.sql) `SELECT * FROM cards WHERE id=${id}`;
        return { totalCount: count.rows[0].count, rows: rows };
    }
    else if (email) {
        email = "%" + email + "%";
        let count = await (0, postgres_1.sql) `SELECT count(*) FROM public.cards WHERE email LIKE ${email};`;
        let { rows } = await (0, postgres_1.sql) `SELECT * FROM cards WHERE email LIKE ${email} LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, email: email, page: page, pageSize: pageSize, rows: rows };
    }
    else {
        let count = await (0, postgres_1.sql) `SELECT count(*) FROM public.cards;`;
        let { rows } = await (0, postgres_1.sql) `SELECT * FROM cards LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, page: page, pageSize: pageSize, rows: rows };
    }
};
exports.readDb = readDb;
const testDb = async () => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT 1`;
    client.release();
    return ret;
};
exports.testDb = testDb;
// Table APPS
const getApps = async () => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.apps`;
    client.release();
    return ret.rows;
};
exports.getApps = getApps;
const getApp = async (app) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.apps WHERE app=${app}`;
    client.release();
    return ret.rows;
};
exports.getApp = getApp;
const createApp = async (app, email) => {
    const client = await postgres_1.db.connect();
    const uid = (0, utils_1.genUniqueId)();
    const ret = await client.sql `INSERT INTO public.apps (uid,app,email) VALUES (${uid},${app},${email})`;
    client.release();
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
    const ret = await client.sql `SELECT * from public.stores`;
    client.release();
    return ret.rows;
};
exports.getStores = getStores;
const getStoreKey = async (uid, key) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.stores WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    return ret.rows[0].data;
};
exports.getStoreKey = getStoreKey;
const getStoreApp = async (uid) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.stores WHERE uid=${uid}`;
    client.release();
    return ret.rows;
};
exports.getStoreApp = getStoreApp;
const createStoreKey = async (uid, key, value) => {
    const client = await postgres_1.db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql `INSERT INTO public.stores (uid,keystore,data) VALUES (${uid},${key},${data})`;
    client.release();
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
    const ret = await client.sql `UPDATE public.stores SET data=${data} WHERE uid=${uid} AND keystore=${key}`;
    client.release();
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
    const ret = await client.sql `DELETE FROM public.stores WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "deleteStoreKey", status: "deleted", uid: uid, key: key };
    }
    else {
        return ret;
    }
};
exports.deleteStoreKey = deleteStoreKey;
const deleteStoreId = async (id) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `DELETE FROM public.stores WHERE id=${id}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "deleteStoreKey", status: "deleted", id: id };
    }
    else {
        return ret;
    }
};
exports.deleteStoreId = deleteStoreId;
// Table AUTHS
const createAuth = async (name, email, password, secret) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `INSERT INTO public.auths (name,email,password,secret) VALUES (${name},${email},${password},${secret})`;
    client.release();
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
    const ret = await client.sql `SELECT * from public.auths where email=${email}`;
    client.release();
    return ret;
};
exports.getAuth = getAuth;
const checkAuth = async (email) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `SELECT * from public.auths where email=${email}`;
    client.release();
    if (ret.rowCount === 1) {
        return { rowCount: ret.rowCount, data: ret.rows[0] };
    }
    else {
        return { rowCount: ret.rowCount };
    }
};
exports.checkAuth = checkAuth;
const updateAuth = async (uid, key, value) => {
    /* const client = await db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql`UPDATE public.stores SET data=${data} WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "updateStoreKey", status: "updated", uid: uid, key: key, data: data }
    } else {
        return ret;
    } */
};
exports.updateAuth = updateAuth;
const deleteAuth = async (id) => {
    const client = await postgres_1.db.connect();
    const ret = await client.sql `DELETE FROM public.auths WHERE id=${id}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "deleteAuth", status: "deleted", id: id };
    }
    else {
        return ret;
    }
};
exports.deleteAuth = deleteAuth;
//# sourceMappingURL=controller.js.map