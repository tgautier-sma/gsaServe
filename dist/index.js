"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env = process.env;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
var cors = require('cors');
require("dotenv/config");
// Vercel Analytics
const analytics_1 = require("@vercel/analytics");
(0, analytics_1.inject)();
// logging system
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    defaultMeta: { service: 'gsa-serve' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
}
/**
 * Import functions for router access
 */
const geo_1 = require("./api/geo");
const db_1 = require("./api/db");
/**
 * Configure server application
 */
const app = (0, express_1.default)();
app.use(cors());
app.use((0, helmet_1.default)());
app.disable('x-powered-by');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.raw());
app.use(body_parser_1.default.text());
logger.info("System launched");
/**
 * APIs for general access to server
 */
app.get("/", (req, res) => {
    res.send("👍 Server working well!");
});
app.get('/api', (req, res) => {
    res.send('Hey ! this is my API running 🥳');
});
app.get('/api/about', (req, res) => {
    res.send('👌 This is my about route..... ');
});
app.get('/api/connect', (req, res) => {
    // db.connect();
    res.send('This is a db connect..... ');
});
app.post('/api/event', (req, res) => {
    console.info(req.body);
    res.send({
        msg: 'POST EVENT request received. See Log for detailed data received.',
        ts: new Date(),
        query: req.query,
        params: req.params,
        body: req.body
    });
});
/**
 * API for GeoPortail access
 */
app.get('/api/geo/config', (req, res) => {
    (0, geo_1.getGeoConfig)().then((config) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error) => {
        res.send(error);
    });
});
/**
 * API for db access - postgres on Vercel
 */
app.get('/api/db', (req, res) => {
    const db = req.query.db || 'cards';
    const page = req.query.page || '1';
    const size = req.query.pageSize || '100';
    const id = req.query.id || null;
    const email = req.query.email || null;
    const dbName = db.toString();
    const pageNumber = page.toString();
    const pageSize = size.toString();
    logger.info(`Read DB ${dbName},page ${page}, pageSize ${pageSize}`);
    (0, db_1.readDb)(dbName, id, email, pageNumber, pageSize).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
app.get('/api/db/test', (req, res) => {
    console.log("Test DB");
    (0, db_1.testDb)().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
/**
 * Api for apps request
 */
app.get('/api/db/apps', (req, res) => {
    (0, db_1.getApps)().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
app.get('/api/db/app/uid', (req, res) => {
    const email = req.query.email || null;
    const app = req.query.app || null;
    if (email && app) {
        (0, db_1.createApp)(app, email).then((data) => {
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
app.get('/api/db/app', (req, res) => {
    const app = req.query.app || null;
    (0, db_1.getApp)(app).then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
/**
 * API for store json database
 */
// Api Store Request
app.get('/api/db/stores', (req, res) => {
    (0, db_1.getStores)().then((data) => {
        res.send(data);
    }).catch((error) => {
        res.send(error);
    });
});
// createStoreKey
app.get('/api/db/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || { "default": new Date() };
    if (uid && key) {
        (0, db_1.createStoreKey)(uid, key, values).then((data) => {
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
app.put('/api/db/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || null;
    if (uid && key && values) {
        (0, db_1.updateStoreKey)(uid, key, values).then((data) => {
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
app.delete('/api/db/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        (0, db_1.deleteStoreKey)(uid, key).then((data) => {
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
app.get('/api/db/store/key', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        (0, db_1.getStoreKey)(uid, key).then((data) => {
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
app.get('/api/db/store/app', (req, res) => {
    const uid = req.query.uid || null;
    if (uid) {
        (0, db_1.getStoreApp)(uid).then((data) => {
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
// Activate Application server
const port = 3000;
app.listen(port, function () {
    console.log('gsaServe server listening on port ' + port + '!');
});
// Export the Express API
module.exports = app;
//# sourceMappingURL=index.js.map