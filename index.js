// index.js
const express = require('express')

const app = express()
const PORT = 4000

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳')
})

app.get('/about', (req, res) => {
    res.send('This is my about route..... ')
})
app.post('/event', (req, res) => {
    console.info(req.body);
    res.send(
        { msg: 'POST EVENT request received. See Log for data received.', data: req.body }
    );
})

// Export the Express API
module.exports = app