"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableAutoTimeStamp = exports.tableCreate = exports.tableList = void 0;
const pg_1 = require("pg");
// Define configuration connection
const env = process.env;
const config = {
    host: env.POSTGRES_HOST,
    port: 5432,
    database: env.POSTGRES_DATABASE,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
};
if (process.env.NODE_ENV === 'production') {
    // Only for Production, need to connect with SSL
    config['.ssl'] = { rejectUnauthorized: false };
}
/**
 * execReq : core method to execute a SQL request
 * @param name string       Api Name, only use to return execution object
 * @param req   string      Request to execute, SQL-compliant
 * @param fields boolean    if TRUE : return Fields description
 * @returns                 status : ok or error
 */
const execReq = async (name, req, fields = false) => {
    const client = new pg_1.Client(config);
    await client.connect();
    try {
        const res = await client.query(req);
        if (res.rowCount >= 1) {
            return {
                api: name,
                status: "ok",
                rowCount: res.rowCount,
                rowAsArray: res.rowAsArray,
                rows: res.rows,
                fields: fields ? res.fields : null
            };
        }
        else {
            return res;
        }
    }
    catch (err) {
        console.error(err);
        return { api: name, status: "error", message: err.message, result: err };
    }
    finally {
        await client.end();
    }
};
/**
 * List TABLES descriptions from the current database
 * @returns
 */
const tableList = async () => {
    let req = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`;
    return await execReq("tableList", req, true);
};
exports.tableList = tableList;
/**
 * CREATE a table with fields definition and 3 common fields :
 * id (incremental),
 * create_on (timestamp),
 * update_on (timestamp)
 * @param table Table Name
 * @param fields Array of fields decription {field:string, type:string, notNull:boolean}
 * @returns
 */
const tableCreate = async (table, fields) => {
    let req = `CREATE TABLE ${table} ( `;
    req = `${req} id serial NOT NULL, `;
    let f = [];
    fields.forEach((field) => {
        const ftype = field.type ? field.type : "varchar(256)";
        const fnull = field.notNull ? "NOT NULL" : "NULL";
        f.push(`${field.name} ${ftype} ${fnull}`);
    });
    req = req + f.join(", ");
    req = req + ", created_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
    req = req + ", updated_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
    req = req + `, CONSTRAINT ${table}_pk PRIMARY KEY (id)`;
    req = req + " );";
    const rc = await execReq("tableCreate", req);
    const ra = await (0, exports.tableAutoTimeStamp)(table);
    return { table: table, create: rc, autoTimestamp: ra };
};
exports.tableCreate = tableCreate;
/**
 * Add a function and a trigger to execute an automatic update of the row modified timestamp
 * @param table Table name
 * @returns
 */
const tableAutoTimeStamp = async (table) => {
    const reqFunc = `
CREATE OR REPLACE FUNCTION update_modified_column() RETURNS TRIGGER AS $$
BEGIN
NEW.updated_on = now();
RETURN NEW;
END;
$$ language 'plpgsql';`;
    const req = `CREATE TRIGGER update_modified_time BEFORE UPDATE ON ${table} FOR EACH ROW EXECUTE PROCEDURE update_modified_column();`;
    const r1 = await execReq("functionAutoUpdate", reqFunc);
    const r2 = await execReq("tableAutoUpdate", req);
    return { functionAutoUpdate: r1, tableAutoUpdate: r2 };
};
exports.tableAutoTimeStamp = tableAutoTimeStamp;
//# sourceMappingURL=control_manage.js.map