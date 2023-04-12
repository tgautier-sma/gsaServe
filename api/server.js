// server.js
const express = require('express');
const helmet = require("helmet");
const bodyParser = require('body-parser');
// const db = require('../lib/db');

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

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
        { msg: 'POST EVENT request received. See Log for data received.', 
        query: req.query,
        params: req.params,
        body:req.body
     }
    );
})

// Export the Express API
module.exports = app