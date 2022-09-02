import express from "express";
import http from "http";
import {Server} from "socket.io";
import Router from "./routes/routes.js";
import cors from 'cors';
import bodyParser from 'body-parser'; // todo: ne ise yarar
import Oyuncu from "./controllers/oyuncu.js";
import {TwoDVector} from "../src/js/kilicli-kavga/utility/twoDVector";
import {WarriorInformation} from "../src/js/kilicli-kavga/warrior";

const app = express();
const server = http.createServer(app);

// use express json
app.use(express.json());

// use cors
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); // todo: ne ise yarar

// use router
app.use(Router);


app.use(express.static('dist'))
/*app.get('/ws', (req, res) => {

})*/

const io = new Server(server);
Oyuncu.io = io;


io.on('connection', (socket) => {
    console.log('a user connected');
    let socketSahibiOyuncu: null | Oyuncu = null;

    socket.on('oyuncuyu sockete bagla', (msg) => {
        console.log('oyuncu sokete baglandi', msg);
        if (Oyuncu.lar[msg.isim]) {
            Oyuncu.lar[msg.isim].socket = socket;
            socketSahibiOyuncu = Oyuncu.lar[msg.isim];
            console.log('yollaniyor');


        }

    });


    socket.on('oyun bilgisi', function (msg) {
        console.log('gonderiliyor', JSON.stringify(msg));
        if (socketSahibiOyuncu) {
            socket.broadcast.emit('oyun bilgisi', msg as WarriorInformation)
        }
    });


    socket.on('disconnect', () => {
        console.log('oyuncu cikti', socketSahibiOyuncu?.isim);
        socketSahibiOyuncu?.sil();
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
