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
        // console.log(res);
        if (res.rowCount >= 0) {
            // calculate the nex id, if exist
            const rows = res.rows;
            const arr = rows.map((item: any) => { return item['id']; });
            const maxId = Math.max(...arr);
            const minId = Math.min(...arr);
            return {
                api: name,
                status: "ok",
                req: req,
                rowCount: res.rowCount,
                minId:minId,
                maxId:maxId,
                rows: res.rows,
                rowAsArray: res.rowAsArray,
                fields: fields ? res.fields : null
            }
        } else {
            return res;
        }
    } catch (err) {
        console.error(err);
        return { api: name, status: "error", message: err.message, result: err, req: req };
    } finally {
        await client.end()
    }
}
/**
 * List TABLES descriptions from the current database
 * @returns 
 */
export const tableList = async (): Promise<any> => {
    let req = `SELECT * FROM public.TABLEREF;`;
    // let req = `SELECT * FROM pg_catalog.pg_tables WHERE schemaname='public';`;
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
    let req = `CREATE TABLE public.${table} ( `;
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
    // Add table in TABLEREF table 
    req = `INSERT INTO public.tableref ("name", "description") VALUES ('${table}', '${table}');`
    const rt = await execReq("tableRefInsert", req);
    return { table: table, create: [rc, rt], autoTimestamp: ra };
}
/**
 * Add a function and a trigger to execute an automatic update of the row modified timestamp
 * @param table Table name
 * @returns 
 */
export const tableAutoTimeStamp = async (table: string) => {
    const reqFunc = `
CREATE OR REPLACE FUNCTION public.update_modified_column() RETURNS TRIGGER AS $$
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
        let req = `INSERT INTO public.${table} (${tname.join(',')}) VALUES(${tvalue.join(',')});`;
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

export const tableData = async (table: string,
    where: string = "",
    order: string = "",
    start: string = "1",
    limit: string = "10") => {
    if (where.length > 1) {
        where = "AND (" + where + ")";
    }
    let reqCount = `SELECT count(*) FROM public.${table} ${where};`;
    let req = `SELECT * public.FROM ${table} WHERE id >= ${start} ${where} LIMIT ${limit};`;
    const resCount=await execReq("tableCount", reqCount, true);
    // console.log(resCount);
    const res=await execReq("tableCount", req, true);
    res.total=resCount.rows[0]['count'];
    return res;
}

/**
 * Database script to  init schema and table
 */
export const initDataModel = async () =>{
    const req=`
-- public.tableref definition
-- Drop table
-- DROP TABLE tableref;
CREATE TABLE public.tableref (
	id serial4 NOT NULL,
	"name" varchar(256) NULL,
	description varchar(256) NULL,
	created_on timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_on timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"data" json NULL,
	CONSTRAINT tableref_pk PRIMARY KEY (id)
);

-- DROP FUNCTION public.update_modified_column();
CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
NEW.updated_on = now();
RETURN NEW;
END;
$function$
;

-- Table Triggers
create trigger update_modified_time before
update
    on
    public.tableref for each row execute function update_modified_column();
    `;
}
