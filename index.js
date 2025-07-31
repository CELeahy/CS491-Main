/*!
 * Four-in-a-Row Server
 * Author: Canon Leahy
 * Date: 2025-07-31
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const STATE_PATH = path.join(__dirname, 'state.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

app.use(express.static('public'));
app.use(express.json());

app.get('/state', (req, res) => {
    if (fs.existsSync(STATE_PATH)) {
        res.json(JSON.parse(fs.readFileSync(STATE_PATH)));
    } else {
        res.json(null);
    }
});

app.post('/state', (req, res) => {
    fs.writeFileSync(STATE_PATH, JSON.stringify(req.body));
    res.json({ status: 'ok' });
});

app.get('/token', (req, res) => {
    if (fs.existsSync(TOKEN_PATH)) {
        res.json(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    } else {
        res.json(null);
    }
});

app.post('/token', (req, res) => {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(req.body));
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Four-in-a-Row app running at http://localhost:${PORT}`);
});
