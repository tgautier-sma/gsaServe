
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, db } from "@vercel/postgres";

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
        let count = await sql`SELECT count(*) FROM cards WHERE id=${id};`;
        let { rows } = await sql`SELECT * FROM cards WHERE id=${id}`;
        return { totalCount: count.rows[0].count, rows: rows };
    } else if (email) {
        // email = "%" + email;
        let count = await sql`SELECT count(*) FROM cards WHERE email=${email};`;
        let { rows } = await sql`SELECT * FROM cards WHERE email=${email} LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, email: email, page: page, pageSize: pageSize, rows: rows };
    } else {
        let count = await sql`SELECT count(*) FROM cards;`;
        let { rows } = await sql`SELECT * FROM cards LIMIT ${pageSize} OFFSET ${offset};`;
        return { totalCount: count.rows[0].count, page: page, pageSize: pageSize, rows: rows };
    }
}

export const testDb = async () => {
    const client = await db.connect();
    const ret = await client.sql`SELECT 1`;
    return ret;
}
