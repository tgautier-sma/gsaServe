// server.js
const env = process.env;
const express = require('express');
const helmet = require("helmet");
const bodyParser = require('body-parser');
// const db = require('../lib/db');
// logging system
const winston = require('winston');
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
}

const geo = require("../api/geo");
const sqlDb = require("../api/db");

const app = express();
app.use(helmet());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
logger.info("System launch");

app.get('/api', (req, res) => {
    res.send('Hey ! this is my API running 🥳')
})

app.get('/api/about', (req, res) => {
    res.send('This is my about route..... ')
})

app.get('/api/connect', (req, res) => {
    // db.connect();
    res.send('This is a db connect..... ')
})

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
// APi for GeoPortail
app.get('/api/geo/config', (req, res) => {
    geo.getGeoConfig().then(config => {
        console.log("=====DATA", config);
        res.send(config);
    }).catch(error => {
        res.send(error);
    });
});
app.get('/api/db', (req, res) => {
    console.log("Read DB");
    sqlDb.readDb().then(data => {
        console.log("=====DATA", data);
        res.send(data);
    }).catch(error => {
        res.send(error);
    });
});

const port = 3000
app.listen(port, function () {
    console.log('gsaServe app listening on port ' + port + '!');
});
// Export the Express API
module.exports = app