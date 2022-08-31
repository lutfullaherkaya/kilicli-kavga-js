export default class Oyuncu {
    constructor(isim) {
        this.socket = null;
        this.isim = isim;
    }
    static olustur(req, res) {
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
        }
        else {
            Oyuncu.lar[req.body.isim] = (new Oyuncu(req.body.isim));
            console.log('oyuncu olusturuldu', req.body.isim);
            res.send({
                isim: req.body.isim,
                message: 'Oyuncu oluşturuldu.',
            });
            Oyuncu.socketeGuncelOyuncuListesiGonder();
        }
    }
    static listele(req, res) {
        res.json(Oyuncu.listesi());
    }
    static listesi() {
        const oyuncuListesi = {};
        for (const oyuncu in Oyuncu.lar) {
            oyuncuListesi[oyuncu] = { isim: Oyuncu.lar[oyuncu].isim };
        }
        return oyuncuListesi;
    }
    static sil(req, res) {
        const isim = req.params.isim;
        if (Oyuncu.lar[isim].sil()) {
            console.log('oyuncu silindi', isim);
            res.send({
                message: 'Oyuncu silindi.',
            });
        }
        else {
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
        var _a;
        (_a = Oyuncu.io) === null || _a === void 0 ? void 0 : _a.emit('oyuncu guncel listesi', Oyuncu.listesi());
    }
}
Oyuncu.lar = {};
Oyuncu.io = null;
//# sourceMappingURL=oyuncu.js.map