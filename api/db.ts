// import { sql } from "@vercel/postgres";
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, db } from "@vercel/postgres";


const pageSize = 10; // Number of records per page
const pageNumber = 1; // Specific page number
const offset = (pageNumber - 1) * pageSize;

export const readDb = async () => {
    console.log("Sql Framework", sql);
    const { rows } = await sql`SELECT * FROM cards LIMIT ${pageSize} OFFSET ${offset};`;
    return rows;
}
export const testDb = async () => {
    const client = await db.connect();
    const ret = await client.sql`SELECT 1`;
    return ret;
}
