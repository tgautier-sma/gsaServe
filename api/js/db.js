// import { sql } from "@vercel/postgres";
const sql = require("@vercel/postgres");

exports.readDb = async () => {
    console.log("Sql Framework", sql);
    const client = await sql.connect();
    console.log("Client",client);
    const { rows } = await client.sql`SELECT * FROM cards;`;
    console.log(rows);
    client.release();
    return rows;
}
