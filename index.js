const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.static('dist'))




const io = new Server(server);
let birinciOyuncuSocket;
let ikinciOyuncuSocket;

io.on('connection', (socket) => {
    console.log('a user connected');
    if (!birinciOyuncuSocket) {
        birinciOyuncuSocket = socket;
    } else if (ikinciOyuncuSocket) {
        ikinciOyuncuSocket = socket;
    }

    socket.on('oyun bilgisi', function(msg) {
        console.log('gonderiliyor', JSON.stringify(msg));
        msg.birinciOyuncudur = (socket === birinciOyuncuSocket);
        socket.broadcast.emit('oyun bilgisi', msg)
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
