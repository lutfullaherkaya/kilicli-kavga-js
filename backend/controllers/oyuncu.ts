import {Request} from 'express';
import {Socket, Server} from 'socket.io';

export default class Oyuncu {
    static lar = {} as {
        [isim: string]: Oyuncu;
    };
    isim: string;
    public socket: null | Socket = null;

    static io: Server | null = null;

    constructor(isim: string) {
        this.isim = isim;
    }

    static olustur(req: any, res: any) {

        // Validate request
        if (!req.body.isim) {
            res.status(400).send({
                message: "İsim boş olamaz.",
            });
            return;
        }
        if (typeof (req.body.isim) === 'string' && req.body.isim.length > 20) {
            res.status(400).send({
                message: "İsim 20 karakterden çok olamaz.",
            });
            return;
        }

        if (Oyuncu.lar[req.body.isim]) {
            res.status(500).send({
                message: "Bu oyuncu zaten var.",
            });
        } else {
            Oyuncu.lar[req.body.isim] = (new Oyuncu(req.body.isim));
            console.log('oyuncu olusturuldu', req.body.isim);
            res.send({
                isim: req.body.isim,
                message: 'Oyuncu oluşturuldu.',
            });
            Oyuncu.socketeGuncelOyuncuListesiGonder();
        }
    }

    static listele(req: any, res: any) {

        res.json(Oyuncu.listesi());
    }

    static listesi() {
        const oyuncuListesi : any = {};
        for (const oyuncu in Oyuncu.lar) {
            oyuncuListesi[oyuncu] = {isim: Oyuncu.lar[oyuncu].isim};
        }
        return oyuncuListesi;
    }

    static sil(req: any, res: any) {
        const isim = req.params.isim;
        if (Oyuncu.lar[isim].sil()) {
            console.log('oyuncu silindi', isim);
            res.send({
                message: 'Oyuncu silindi.',
            });
        } else {
            res.status(500).send({
                message: 'Çevrim içi oyunculardan çıkarmak için oyuncu bulunamadı.',
            });
        }
    }

    sil() {
        if (Oyuncu.lar[this.isim]) {
            delete Oyuncu.lar[this.isim];
            Oyuncu.socketeGuncelOyuncuListesiGonder();
            return true;
        }
        Oyuncu.socketeGuncelOyuncuListesiGonder();
        return false;
    }

    static socketeGuncelOyuncuListesiGonder() {
        Oyuncu.io?.emit('oyuncu guncel listesi', Oyuncu.listesi());
    }
}
