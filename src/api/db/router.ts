import express from "express";
import { requireToken } from "../../request";

const router = express.Router();
const appSecret = 'supersecret';
import {
    readDb, testDb,
    getApps, createApp, getApp,
    getStores, createStoreKey, updateStoreKey, deleteStoreId,
    getStoreKey, getStoreApp
} from "./controller";
import {
    tableCreate, tableList, tableDef, tableInsert
} from "./control_manage";



router.get('/', requireToken, (req, res) => {
    res.send("👍 Server db working well!");
})
/**
 * API for db access - postgres on Vercel
 */
router.get('/query', (req, res) => {
    const db = req.query.db || 'cards';
    const page = req.query.page || '1';
    const size = req.query.pageSize || '100';
    const id = req.query.id || null;
    const email = req.query.email || null;
    const dbName: string = db.toString();
    const pageNumber: string = page.toString();
    const pageSize: string = size.toString();

    // logger.info(`Read DB ${dbName},page ${page}, pageSize ${pageSize}`);
    readDb(dbName, id, email, pageNumber, pageSize).then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
router.get('/table/list', (req, res) => {
    tableList().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
router.post('/table/create', (req, res) => {
    const table = req.query.table || null;
    const tableName: string = table.toString();
    const { fields } = req.body;
    let fieldsDef: Array<any> = [];
    if (!Array.isArray(fields)) {
        // Simple definition : name separated with a comma
        fieldsDef = fields.split(',').map((item: any) => {
            return { "name": item, "header": item }
        });
    } else {
        fieldsDef = fields;
    }
    if (fieldsDef.length >= 1) {
        tableCreate(tableName, fieldsDef).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send("No field definition");
    }

});
router.get('/table/def', (req, res) => {
    const table = req.query.table || null;
    const tableName: string = table.toString();
    tableDef(tableName).then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
router.post('/table/insert', (req, res) => {
    const table = req.query.table || null;
    if (table) {
        const tableName: string = table.toString();
        const { data } = req.body;
        tableInsert(tableName, data).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send('No table specified');
    }
});
router.get('/test', requireToken, (req, res) => {
    console.log("Test DB");
    testDb().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

/**
 * Api for apps request
 */
router.get('/apps', requireToken, (req, res) => {
    getApps().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
router.get('/app/uid', requireToken, (req, res) => {
    const email = req.query.email || null;
    const app = req.query.app || null;
    if (email && app) {
        createApp(app, email).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send({
                ts: new Date(),
                status: 'error',
                msg: 'Email and application code already exists. No account created.'
            });
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Email and application code is mandatory. No account created.'
        });
    }
});
router.get('/app', (req, res) => {
    const app = req.query.app || null;
    getApp(app).then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

/**
 * API for store json database
 */
// Api Store Request
router.get('/stores', (req, res) => {
    getStores().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
// createStoreKey
router.get('/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || { "default": new Date() };
    if (uid && key) {
        createStoreKey(uid, key, values).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store created.`
                });
            } else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Key ${key} for this application code already exists. No store created.`
                });
            }
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store created.'
        });
    }
});
router.put('/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || null;
    if (uid && key && values) {
        updateStoreKey(uid, key, values).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store updated.`
                });
            } else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Key ${key} for this application code already exists. No store updated.`
                });
            }
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store updated.'
        });
    }
});
router.delete('/store', (req, res) => {
    const id = req.query.id || null;
    if (id) {
        deleteStoreId(id).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send({
                ts: new Date(),
                status: 'error',
                code: error.code,
                msg: `No store delete.`
            });
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Store Id is mandatory. No store updated.'
        });
    }
});
router.get('/store/key', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        getStoreKey(uid, key).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store readed.'
        });
    }
});
router.get('/store/app', (req, res) => {
    const uid = req.query.uid || null;
    if (uid) {
        getStoreApp(uid).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code is mandatory. No store readed.'
        });
    }
});


module.exports = router;