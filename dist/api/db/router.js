"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const request_1 = require("../../request");
const router = express_1.default.Router();
const appSecret = 'supersecret';
const controller_1 = require("./controller");
router.get('/', request_1.requireToken, (req, res) => {
    res.send("👍 Server db working well!");
});
/**
 * API for db access - postgres on Vercel
 */
router.get('/query', (req, res) => {
    const db = req.query.db || 'cards';
    const page = req.query.page || '1';
    const size = req.query.pageSize || '100';
    const id = req.query.id || null;
    const email = req.query.email || null;
    const dbName = db.toString();
    const pageNumber = page.toString();
    const pageSize = size.toString();
    // logger.info(`Read DB ${dbName},page ${page}, pageSize ${pageSize}`);
    (0, controller_1.readDb)(dbName, id, email, pageNumber, pageSize).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
router.get('/test', request_1.requireToken, (req, res) => {
    console.log("Test DB");
    (0, controller_1.testDb)().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
/**
 * Api for apps request
 */
router.get('/apps', request_1.requireToken, (req, res) => {
    (0, controller_1.getApps)().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
router.get('/app/uid', request_1.requireToken, (req, res) => {
    const email = req.query.email || null;
    const app = req.query.app || null;
    if (email && app) {
        (0, controller_1.createApp)(app, email).then((data) => {
            res.send(data);
        }).catch((error) => {
            res.send({
                ts: new Date(),
                status: 'error',
                msg: 'Email and application code already exists. No account created.'
            });
        });
    }
    else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Email and application code is mandatory. No account created.'
        });
    }
});
router.get('/app', (req, res) => {
    const app = req.query.app || null;
    (0, controller_1.getApp)(app).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
/**
 * API for store json database
 */
// Api Store Request
router.get('/stores', (req, res) => {
    (0, controller_1.getStores)().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
// createStoreKey
router.get('/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || { "default": new Date() };
    if (uid && key) {
        (0, controller_1.createStoreKey)(uid, key, values).then((data) => {
            res.send(data);
        }).catch((error) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store created.`
                });
            }
            else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Key ${key} for this application code already exists. No store created.`
                });
            }
        });
    }
    else {
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
        (0, controller_1.updateStoreKey)(uid, key, values).then((data) => {
            res.send(data);
        }).catch((error) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store updated.`
                });
            }
            else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Key ${key} for this application code already exists. No store updated.`
                });
            }
        });
    }
    else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store updated.'
        });
    }
});
router.delete('/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        (0, controller_1.deleteStoreKey)(uid, key).then((data) => {
            res.send(data);
        }).catch((error) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store deleted.`
                });
            }
            else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `No store delete.`
                });
            }
        });
    }
    else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store updated.'
        });
    }
});
router.get('/store/key', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        (0, controller_1.getStoreKey)(uid, key).then((data) => {
            res.send(data);
        }).catch((error) => {
            res.send(error);
        });
    }
    else {
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
        (0, controller_1.getStoreApp)(uid).then((data) => {
            res.send(data);
        }).catch((error) => {
            res.send(error);
        });
    }
    else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code is mandatory. No store readed.'
        });
    }
});
module.exports = router;
//# sourceMappingURL=router.js.map