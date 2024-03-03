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
// import { inject } from '@vercel/analytics';
// inject();
/**
 * Logging system
 */
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
    res.send('This is a db connect..... ');
});
// Explain POST request event
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
 * Routing configuration
 */
var authRouter = require('./api/auth/router');
var dbRouter = require('./api/db/router');
var geoRouter = require('./api/geo/router');
/* var aiRouter = require('./api/ai/router'); */
// var filesRouter = require('./api/files/router');
// var toolsRouter = require('./api/tools/router');
app.use("/api/auth", authRouter);
app.use("/api/db", dbRouter);
app.use("/api/geo", geoRouter);
/* app.use("/api/ai", aiRouter); */
// app.use("/api/files", filesRouter);
// app.use("/api/tools", toolsRouter);
// **** End Routing ****
// Activate Application server
const port = 3000;
app.listen(port, function () {
    console.log('gsaServe server listening on port ' + port + '!');
});
// Export the Express API
module.exports = app;
//# sourceMappingURL=index.js.map