"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const readDb = (db, id, email, page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = (+page - 1) * +pageSize;
    const dbName = db.toUpperCase();
    if (id) {
        let count = yield (0, postgres_1.sql) `SELECT count(*) FROM cards WHERE id=${id};`;
        let { rows } = yield (0, postgres_1.sql) `SELECT * FROM cards WHERE id=${id}`;
        return { totalCount: count.rows[0].count, rows: rows };
    }
    else if (email) {
        // email = "%" + email;
        let count = yield (0, postgres_1.sql) `SELECT count(*) FROM cards WHERE email=${email};`;
        let { rows } = yield (0, postgres_1.sql) `SELECT * FROM cards WHERE email=${email} LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, email: email, page: page, pageSize: pageSize, rows: rows };
    }
    else {
        let count = yield (0, postgres_1.sql) `SELECT count(*) FROM cards;`;
        let { rows } = yield (0, postgres_1.sql) `SELECT * FROM cards LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, page: page, pageSize: pageSize, rows: rows };
    }
});
exports.readDb = readDb;
const testDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield postgres_1.db.connect();
    const ret = yield client.sql `SELECT 1`;
    return ret;
});
exports.testDb = testDb;
//# sourceMappingURL=db.js.map