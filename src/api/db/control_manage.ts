import { Client } from 'pg';

// Define configuration connection
const env = process.env;
const config: any = {
    host: env.POSTGRES_HOST,
    port: 5432,
    database: env.POSTGRES_DATABASE,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
}
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
const execReq = async (name: any, req: any, fields: boolean = false): Promise<any> => {
    const client = new Client(config);
    await client.connect()
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
            }
        } else {
            return res;
        }
    } catch (err) {
        console.error(err);
        return { api: name, status: "error", message: err.message, result: err };
    } finally {
        await client.end()
    }
}
/**
 * List TABLES descriptions from the current database
 * @returns 
 */
export const tableList = async (): Promise<any> => {
    let req = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`;
    return await execReq("tableList", req, true);
}

/**
 * CREATE a table with fields definition and 3 common fields : 
 * id (incremental), 
 * create_on (timestamp), 
 * update_on (timestamp)
 * @param table Table Name
 * @param fields Array of fields decription {field:string, header:string, type:string, size:string, notNull:boolean}
 * @returns 
 */
export const tableCreate = async (table: string, fields: any) => {
    console.log(`(i) Create table ${table}, ${fields.length} fields`);
    let req = `CREATE TABLE ${table} ( `;
    req = `${req} id serial NOT NULL, `;
    let f: Array<string> = [];
    fields.forEach((field: any) => {
        const ftype = (field.type ? field.type : "varchar").toUpperCase();
        const fnull = field.notNull ? "NOT NULL" : "NULL";
        let fsize = "";
        if (["CHAR", "VARCHAR"].includes(ftype)) {
            fsize = "(" + (field.size ? field.size : "256") + ")";
        }
        f.push(`${field.name} ${ftype}${fsize} ${fnull}`);
    });
    req = req + f.join(", ");
    req = req + ", created_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
    req = req + ", updated_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
    req = req + `, CONSTRAINT ${table}_pk PRIMARY KEY (id)`;
    req = req + " );";
    const rc = await execReq("tableCreate", req);
    const ra = await tableAutoTimeStamp(table);
    return { table: table, create: rc, autoTimestamp: ra };
}
/**
 * Add a function and a trigger to execute an automatic update of the row modified timestamp
 * @param table Table name
 * @returns 
 */
export const tableAutoTimeStamp = async (table: string) => {
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
}

export const tableDef = async (table: string) => {
    let req = `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
  FROM information_schema.columns 
  WHERE  table_name = '${table}';`;
    return await execReq("tablDef", req, false);
}

export const tableInsert = async (table: string, data: Array<any>) => {
    console.log(`(i) Batch insert. Table:${table}. Rows:${data.length}`);
    // 1. Get Table structure
    const res: any = await tableDef(table);
    console.log("Table def ", res);
    let tDef = res.rows.map((item: any) => item.column_name);
    var filteredDef = tDef.filter((e: any) => { return (e !== 'id' && e != "created_on" && e !== 'updated_on') });
    // 2. Generate sql script
    let reqList: any = [];
    let scriptList: any = [];
    let scriptListResult: any = [];
    let i = 1;
    let numScript = 1;
    data.forEach(row => {
        const rowKeys = Object.keys(row);
        var tvalue: any = [];
        var tname: any = [];
        rowKeys.forEach(field => {
            if (filteredDef.includes(field.toLowerCase())) {
                let v = row[field] + "";
                try {
                    v = v.replace(/'/g, "''");
                } catch (error) {
                    console.log("==> Error replace", error);
                }
                let vf = "'" + v + "'";
                tname.push(field)
                tvalue.push(vf);
            } 
        });
        let req = `INSERT INTO ${table} (${tname.join(',')}) VALUES(${tvalue.join(',')});`;
        reqList.push(req);
        console.log("Ajout de la requete n°", i);
        if (i % 10 == 0) {
            // execute script
            console.log("Création du script", numScript);
            scriptList.push(reqList.join(''));
            reqList = [];
            numScript++;
        }
        i++;
    });
    scriptList.push(reqList.join(''));
    var scriptLot = 1;
    scriptList.forEach((script: any) => {
        console.log("Execute script ", scriptLot);
        const resScript = execReq("tableInsert", script, false);
        scriptListResult.push(resScript);
        scriptLot++
    });
    return { script: scriptList, result: scriptListResult };
}
