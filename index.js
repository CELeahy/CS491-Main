const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN_PATH = path.join(__dirname, 'token.json');

app.use(express.static('public'));
app.use(express.json());

// Read token from file
app.get('/token', (req, res) => {
    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
        res.json(JSON.parse(token));
    } else {
        res.json(null);
    }
});

// Write token to file
app.post('/token', (req, res) => {
    const token = req.body;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Ping app running at http://localhost:${PORT}`);
});
