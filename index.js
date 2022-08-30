const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.static('dist'))
app.get('/ws', (req, res) => {
    console.log('asdf');
})


const io = new Server(server);


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('oyun bilgisi', function(msg) {
        console.log('gonderiliyor', JSON.stringify(msg));
/*
        socket.broadcast.emit('oyun bilgisi', msg)
*/
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
