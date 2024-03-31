const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');


app.get('/', (req, res) => {
    res.json({
        success: true,
    });
});

app.get('/auticate',(req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.listen(port, () => {
    console.log('server started');
});