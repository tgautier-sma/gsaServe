
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, db } from "@vercel/postgres";
import { genUniqueId } from '../../tools';


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

export const readDb = async (db: string, id: any, email: any, page: string, pageSize: string) => {
    const offset = (+page - 1) * +pageSize;
    const dbName = db.toUpperCase();
    if (id) {
        let count = await sql`SELECT count(*) FROM public.cards WHERE id=${id};`;
        let { rows } = await sql`SELECT * FROM cards WHERE id=${id}`;
        return { totalCount: count.rows[0].count, rows: rows };
    } else if (email) {
        // email = "%" + email;
        let count = await sql`SELECT count(*) FROM public.cards WHERE email=${email};`;
        let { rows } = await sql`SELECT * FROM cards WHERE email=${email} LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, email: email, page: page, pageSize: pageSize, rows: rows };
    } else {
        let count = await sql`SELECT count(*) FROM public.cards;`;
        let { rows } = await sql`SELECT * FROM cards LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, page: page, pageSize: pageSize, rows: rows };
    }
}
export const testDb = async () => {
    const client = await db.connect();
    const ret = await client.sql`SELECT 1`;
    client.release();
    return ret;
}
// Table APPS
export const getApps = async () => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.apps`;
    client.release();
    return ret.rows;
}
export const getApp = async (app: any) => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.apps WHERE app=${app}`;
    client.release();
    return ret.rows;
}
export const createApp = async (app: any, email: any) => {
    const client = await db.connect();
    const uid = genUniqueId();
    const ret = await client.sql`INSERT INTO public.apps (uid,app,email) VALUES (${uid},${app},${email})`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "createApp", status: "created", email: email, app: app, uid: uid }
    } else {
        return ret;
    }
}

// Table store
export const getStores = async () => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.stores`;
    client.release();
    return ret.rows;
}
export const getStoreKey = async (uid: any, key: any) => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.stores WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    return ret.rows[0].data;
}
export const getStoreApp = async (uid: any) => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.stores WHERE uid=${uid}`;
    client.release();
    return ret.rows;
}
export const createStoreKey = async (uid: any, key: any, value: any) => {
    const client = await db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql`INSERT INTO public.stores (uid,keystore,data) VALUES (${uid},${key},${data})`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "createStoreKey", status: "created", uid: uid, key: key, data: data }
    } else {
        return ret;
    }
}
export const updateStoreKey = async (uid: any, key: any, value: any) => {
    const client = await db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql`UPDATE public.stores SET data=${data} WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "updateStoreKey", status: "updated", uid: uid, key: key, data: data }
    } else {
        return ret;
    }
}
export const deleteStoreKey = async (uid: any, key: any) => {
    const client = await db.connect();
    const ret = await client.sql`DELETE FROM public.stores WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "deleteStoreKey", status: "deleted", uid: uid, key: key }
    } else {
        return ret;
    }
}
export const deleteStoreId = async (id: any) => {
    const client = await db.connect();
    const ret = await client.sql`DELETE FROM public.stores WHERE id=${id}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "deleteStoreKey", status: "deleted", id: id }
    } else {
        return ret;
    }
}


// Table AUTHS
export const createAuth = async (name: any, email: any, password: any, secret: any) => {
    const client = await db.connect();
    const ret = await client.sql`INSERT INTO public.auths (name,email,password,secret) VALUES (${name},${email},${password},${secret})`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "createAuth", status: "created", uid: 'aa' }
    } else {
        return ret;
    }
}
export const getAuth = async (email: any) => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.auths where email=${email}`;
    client.release();
    return ret;
}
export const checkAuth = async (email: any) => {
    const client = await db.connect();
    const ret = await client.sql`SELECT * from public.auths where email=${email}`;
    client.release();
    if (ret.rowCount === 1) {
        return { rowCount: ret.rowCount, data: ret.rows[0] };
    } else {
        return { rowCount: ret.rowCount };
    }
}
export const updateAuth = async (uid: any, key: any, value: any) => {
    /* const client = await db.connect();
    const data = (typeof value === "string" ? JSON.stringify({ data: value }) : JSON.stringify(value));
    const ret = await client.sql`UPDATE public.stores SET data=${data} WHERE uid=${uid} AND keystore=${key}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "updateStoreKey", status: "updated", uid: uid, key: key, data: data }
    } else {
        return ret;
    } */
}
export const deleteAuth = async (id: any) => {
    const client = await db.connect();
    const ret = await client.sql`DELETE FROM public.auths WHERE id=${id}`;
    client.release();
    if (ret.rowCount == 1) {
        return { api: "deleteAuth", status: "deleted", id: id }
    } else {
        return ret;
    }
}