// import { sql } from "@vercel/postgres";
import { sql } from "@vercel/postgres";

export const readDb = async () => {
    console.log("Sql Framework", sql);
    const client = await sql.connect();
    console.log("Client", client);
    const { rows } = await client.sql`SELECT * FROM cards;`;
    console.log(rows);
    client.release();
    return rows;
}
module.exports = readDb;