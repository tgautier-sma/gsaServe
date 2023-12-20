"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDb = exports.readDb = void 0;
const postgres_1 = require("@vercel/postgres");
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
//# sourceMappingURL=db.js.map