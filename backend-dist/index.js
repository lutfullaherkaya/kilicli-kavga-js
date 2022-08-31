import express from "express";
import http from "http";
import { Server } from "socket.io";
import Router from "./routes/routes.js";
import cors from 'cors';
import bodyParser from 'body-parser'; // todo: ne ise yarar
import Oyuncu from "./controllers/oyuncu.js";
const app = express();
const server = http.createServer(app);
// use express json
app.use(express.json());
// use cors
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // todo: ne ise yarar
// use router
app.use(Router);
app.use(express.static('dist'));
/*app.get('/ws', (req, res) => {

})*/
const io = new Server(server);
Oyuncu.io = io;
io.on('connection', (socket) => {
    console.log('a user connected');
    let socketSahibiOyuncu = null;
    socket.on('oyuncuyu sockete bagla', (msg) => {
        console.log(msg);
        if (Oyuncu.lar[msg.isim]) {
            Oyuncu.lar[msg.isim].socket = socket;
            socketSahibiOyuncu = Oyuncu.lar[msg.isim];
        }
    });
    socket.on('oyun bilgisi', function (msg) {
        console.log('gonderiliyor', JSON.stringify(msg));
        /*
                socket.broadcast.emit('oyun bilgisi', msg)
        */
    });
    socket.on('disconnect', () => {
        console.log('oyuncu cikti', socketSahibiOyuncu === null || socketSahibiOyuncu === void 0 ? void 0 : socketSahibiOyuncu.isim);
        socketSahibiOyuncu === null || socketSahibiOyuncu === void 0 ? void 0 : socketSahibiOyuncu.sil();
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
//# sourceMappingURL=index.js.map