"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env = process.env;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv/config");
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
const geo_1 = require("./api/geo");
const db_1 = require("./api/db");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.raw());
app.use(body_parser_1.default.text());
logger.info("System launched");
app.get("/", (req, res) => {
    res.send("Hello from server !");
});
app.get('/api', (req, res) => {
    res.send('Hey ! this is my API running 🥳');
});
app.get('/api/about', (req, res) => {
    res.send('This is my about route..... ');
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
// APi for GeoPortail
app.get('/api/geo/config', (req, res) => {
    (0, geo_1.getGeoConfig)().then((config) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error) => {
        res.send(error);
    });
});
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
const port = 3000;
app.listen(port, function () {
    console.log('gsaServe app listening on port ' + port + '!');
});
// Export the Express API
module.exports = app;
//# sourceMappingURL=index.js.map