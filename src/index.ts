import express from 'express';
import helmet from "helmet";
import bodyParser from 'body-parser';
var cors = require('cors')

// Load environment variables
const env = process.env;
const envFileName = `.env.${env.NODE_ENV || "development"}`
import dotenv from 'dotenv';
dotenv.config({ path: envFileName });

// Vercel Analytics
// import { inject } from '@vercel/analytics';
// inject();

/**
 * Logging system
 */
import winston from 'winston';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'gsa-serve' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
} else {

}

/**
 * Configure server application
 */
const app = express();
app.use(cors());
app.use(helmet());
app.disable('x-powered-by');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

logger.info("System launched for " + env.NODE_ENV);


/**
 * APIs for general access to server
 */
app.get("/", (req, res) => {
    res.send("👍 Server working well!");
});

app.get('/api', (req, res) => {
    res.send('Hey ! this is my API running 🥳')
})
app.get('/api/about', (req, res) => {
    res.send('👌 This is my about route..... ')
})
app.get('/api/connect', (req, res) => {
    res.send('This is a db connect..... ')
})

// Explain POST request event
app.post('/api/event', (req, res) => {
    console.info(req.body);
    res.send(
        {
            msg: 'POST EVENT request received. See Log for detailed data received.',
            ts: new Date(),
            query: req.query,
            params: req.params,
            body: req.body
        }
    );
})

/**
 * Routing configuration
 */
var authRouter = require('./api/auth/router');
var dbRouter = require('./api/db/router');
var geoRouter = require('./api/geo/router');
/* var aiRouter = require('./api/ai/router'); */
var filesRouter = require('./api/files/router');
var toolsRouter = require('./api/tools/router');
app.use("/api/auth", authRouter);
app.use("/api/db", dbRouter);
app.use("/api/geo", geoRouter);
/* app.use("/api/ai", aiRouter); */
app.use("/api/files", filesRouter);
app.use("/api/tools", toolsRouter);
// **** End Routing ****

// Activate Application server
const port = 3000
app.listen(port, function () {
    console.log('gsaServe server listening on port ' + port + '!');
});

// Export the Express API
module.exports =  app;

