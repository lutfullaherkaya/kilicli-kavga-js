const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(express.static('public'))


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
