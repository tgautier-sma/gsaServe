import { Client } from 'pg';
const env = process.env;
const config = {
    host: env.POSTGRES_HOST,
    port: 5432,
    database: env.POSTGRES_DATABASE,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    ssl:{rejectUnauthorized: false}
}

// Table CREATE and UDPATE
// field:name, type, length
export const tableCreate = async (table: string, fields: any) => {
    let req = `CREATE TABLE ${table} ( `;
    req = `${req} id serial NOT NULL, `;
    let f: Array<string> = [];
    fields.forEach((field: any) => {
        f.push(`${field.name} varchar NULL`);
    });
    req = req + f.join(", ");
    req = req + ", created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
    req = req + `, CONSTRAINT ${table}_pk PRIMARY KEY (id)`;
    req = req + " );";
    // console.log(`${req}`);
    console.log("Connect to db");
    const client = new Client(config);
    await client.connect()
    try {
        const res = await client.query(req);
        console.log(res) // Hello world!
        if (res.rowCount == 1) {
            return { api: "createTable", status: "created", table:table,result:res }
        } else {
            return res;
        }
     } catch (err) {
        console.error(err);
        return err
     } finally {
        await client.end()
     }
}