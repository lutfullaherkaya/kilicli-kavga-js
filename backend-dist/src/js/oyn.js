/**
 * todo: hasar alınca ses çıksın vıcık vıcık
 */
export class Tuval {
    constructor(canvas, genislik, yukseklik, yerKordianti) {
        this.canvas = canvas;
        this.canvas.width = genislik;
        this.canvas.height = yukseklik;
        this.yerKordinati = yerKordianti;
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.zaman = 90;
        this.temizle();
        this.fps = 60; // bu değer sürekli güncellenecek
    }
    temizle() {
        this.context.fillStyle = '#0b2e2f';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    setZamanKutucugu() {
        document.getElementById('zaman').innerText = String(this.zaman--);
    }
    /**
     *  Benim ekranım 144hz olduğu için 144hz'ye göre hesaplıyorum. Mesela 60 fps'de iki kat hızlı olması gerek bundan
     *  dolayı animasyonların.
     */
    gercekHiz(hiz) {
        return hiz * 144 / this.fps;
    }
    gercekSahneSayisi(sahneSayisi) {
        return Math.max(1, Math.round(sahneSayisi * this.fps / 144));
    }
}
export class Dikdortgen {
    constructor(tuval, x, y, genislik, yukseklik, renk, carpisabilir = true) {
        this.tuval = tuval;
        this.x = x;
        this.y = y;
        this.genislik = genislik;
        this.yukseklik = yukseklik;
        this.renk = renk;
        this.carpisabilir = carpisabilir;
    }
    ciz() {
        this.tuval.context.fillStyle = this.renk;
        this.tuval.context.fillRect(this.x, this.y, this.genislik, this.yukseklik);
    }
    yerdedir() {
        return this.y + this.yukseklik >= this.tuval.yerKordinati;
    }
    static carpisir(dikdortgen1, dikdortgen2) {
        return dikdortgen1.carpisabilir && dikdortgen2.carpisabilir &&
            !dikdortgen1.solundadir(dikdortgen2) &&
            !dikdortgen1.sagindadir(dikdortgen2) &&
            !dikdortgen1.yukarisindadir(dikdortgen2) &&
            !dikdortgen1.asagisindadir(dikdortgen2);
    }
    solundadir(dikdortgen) {
        return this.x + this.genislik <= dikdortgen.x;
    }
    sagindadir(dikdortgen) {
        return this.x >= dikdortgen.x + dikdortgen.genislik;
    }
    yukarisindadir(dikdortgen) {
        return this.y + this.yukseklik <= dikdortgen.y;
    }
    asagisindadir(dikdortgen) {
        return this.y >= dikdortgen.y + dikdortgen.yukseklik;
    }
    merkezKordinat() {
        return {
            x: this.x + this.genislik / 2,
            y: this.y + this.yukseklik / 2,
        };
    }
}
/**
 * Bu hocama teşekkürler grafik için
 * https://aamatniekss.itch.io/fantasy-knight-free-pixelart-animated-character
 *
 */
export class Sprite {
    constructor(tuval, { pozisyon = { x: 0, y: 0 }, pozisyonOffset = { x: 0, y: 0 }, resimKaynagi = '', skala = 1, resimSayisi = 1, sonsuzAnimasyon = true, sonundaSonSahneyiTut = false, isim = 'sprite', kacSahnedeResimDegisir = 10, yonuSagdir = false, }) {
        this.tuval = tuval;
        this.pozisyon = pozisyon;
        this.pozisyonOffset = pozisyonOffset;
        this.resimSayisi = resimSayisi;
        this.sonsuzAnimasyon = sonsuzAnimasyon;
        this.isim = isim;
        this.suankiResim = 0;
        this.skala = skala;
        this.resim = new Image();
        this.resim.src = resimKaynagi;
        this.resim.classList;
        this.resimSayisi = resimSayisi;
        this.yonuSagdir = yonuSagdir;
        this.sonundaSonSahneyiTut = sonundaSonSahneyiTut;
        this.kacSahnedeResimDegisir = kacSahnedeResimDegisir;
        if (this.isim == 'donme') {
            this.kacSahnedeResimDegisir = 20;
        }
        this.suankiSahne = 0;
        this.gercekKacSahnedeResimDegistir = this.tuval.gercekSahneSayisi(this.kacSahnedeResimDegisir);
        this.birKereTamAnimasyonOldu = false;
    }
    ciz() {
        this.tuval.context.drawImage(this.resim, (this.suankiResim % this.resimSayisi) * (this.resim.width / this.resimSayisi), 0, this.resim.width / this.resimSayisi, this.resim.height, this.pozisyon.x + this.pozisyonOffset.x, this.pozisyon.y + this.pozisyonOffset.y, (this.resim.width / this.resimSayisi) * this.skala, this.resim.height * this.skala);
        return this;
    }
    animasyonBasaSar() {
        this.suankiResim = 0;
        this.suankiSahne = 0;
        this.birKereTamAnimasyonOldu = false;
        this.gercekKacSahnedeResimDegistir = this.tuval.gercekSahneSayisi(this.kacSahnedeResimDegisir);
    }
    guncelle() {
        if (this.suankiResim === this.resimSayisi) {
            this.birKereTamAnimasyonOldu = true;
            if (!this.sonsuzAnimasyon && this.birKereTamAnimasyonOldu && this.sonundaSonSahneyiTut) {
                this.suankiResim = this.resimSayisi - 1;
            }
        }
        if (this.sonsuzAnimasyon || !this.birKereTamAnimasyonOldu || this.sonundaSonSahneyiTut) {
            this.ciz();
        }
        if (this.suankiSahne === 0) {
            this.suankiResim++;
            this.gercekKacSahnedeResimDegistir = this.tuval.gercekSahneSayisi(this.kacSahnedeResimDegisir);
        }
        this.suankiSahne = (this.suankiSahne + 1) % this.gercekKacSahnedeResimDegistir;
        return this;
    }
}
export class SavasciCarpisma {
    static engelle() {
        Savasci.lar.forEach((savaskar1) => {
            Savasci.lar.forEach((savaskar2) => {
                if (savaskar1 !== savaskar2) {
                    SavasciCarpisma.carpismayacakKadarOtele(savaskar1, savaskar2);
                }
            });
        });
    }
    /**
     * @param savasci1 ötelenecek nesne
     * @param savasci2
     */
    static carpismayacakKadarOtele(savasci1, savasci2) {
        if (Dikdortgen.carpisir(savasci1.hitKutusu, savasci2.hitKutusu)) {
            if (Math.abs(savasci1.hitKutusu.merkezKordinat().y - savasci2.hitKutusu.merkezKordinat().y) <
                Math.abs(savasci1.hitKutusu.merkezKordinat().x - savasci2.hitKutusu.merkezKordinat().x)) {
                SavasciCarpisma.yataydaKenarinaOtele(savasci1, savasci2);
                savasci1.ivme.x = 0;
                savasci1.hiz.x = 0;
            }
            else {
                SavasciCarpisma.duseydeKenarinaOtele(savasci1, savasci2);
                savasci1.hiz.y = 0;
                savasci1.ivme.y = 0;
            }
        }
    }
    static duseydeKenarinaOtele(savasci1, savasci2) {
        if (savasci1.hitKutusu.merkezKordinat().y < savasci2.hitKutusu.merkezKordinat().y) { // yukarisinda olacak
            savasci1.hitKutusu.y = savasci2.hitKutusu.y - savasci1.hitKutusu.yukseklik;
        }
        else if (savasci1.hitKutusu.merkezKordinat().y >= savasci2.hitKutusu.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savasci2.hitKutusu.y + savasci2.hitKutusu.yukseklik;
            if (yeniYPozisyonu < savasci1.tuval.yerKordinati - savasci1.hitKutusu.yukseklik) {
                savasci1.hitKutusu.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }
    static yataydaKenarinaOtele(savasci1, savasci2) {
        if (savasci1.hitKutusu.merkezKordinat().x < savasci2.hitKutusu.merkezKordinat().x) { // solunda olacak
            savasci1.hitKutusu.x = savasci2.hitKutusu.x - savasci1.hitKutusu.genislik;
        }
        else if (savasci1.hitKutusu.merkezKordinat().x > savasci2.hitKutusu.merkezKordinat().x) { // saginda olacak
            savasci1.hitKutusu.x = savasci2.hitKutusu.x + savasci2.hitKutusu.genislik;
        }
    }
}
// todo: yonetici ekle. bot veya klavyeOk veya klavyeWASD veya uzaktanOyuncu olabilir.
export class KontrolYoneticisi {
    constructor(galeAlinacakIsim) {
        this.kontroller = null;
        this.yonetiliyor = false;
        this.galeAlinacakIsim = galeAlinacakIsim;
    }
    kontrolGuncelle(baziKontroller) {
        if (this.kontroller && this.yonetiliyor) {
            Object.assign(this.kontroller, baziKontroller);
        }
    }
}
export class YayinciKontrolYoneticisi extends KontrolYoneticisi {
    constructor(galeAlinacakIsim, socket) {
        super(galeAlinacakIsim);
        this.socket = socket;
    }
    kontrolGuncelle(baziKontroller) {
        if (this.kontroller && this.yonetiliyor) {
            Object.assign(this.kontroller, baziKontroller);
            this.socket.emit('oyun bilgisi', {
                isim: this.galeAlinacakIsim,
                kontroller: baziKontroller
            });
        }
    }
}
export class KlavyeKontrolYoneticisi extends YayinciKontrolYoneticisi {
    constructor(galeAlinacakIsim, socket, wasdMi, fareDeKullan = false, fareElementi = null) {
        super(galeAlinacakIsim, socket);
        this.wasdTuslari = {
            saldiri: ' ',
            sagKosu: ["d", "D"],
            solKosu: ['a', 'A'],
            sonKosulanYonSagdir: ['d', 'D', 'a!', 'A!'],
            taklaAt: "Shift",
            zipla: ["w", "W"],
        };
        this.okTuslari = {
            saldiri: 'ArrowDown',
            sagKosu: "ArrowRight",
            solKosu: "ArrowLeft",
            sonKosulanYonSagdir: ["ArrowRight", 'ArrowLeft!'],
            taklaAt: ".",
            zipla: "ArrowUp",
        };
        this.secilenTuslarTersi = {};
        this.keydownHalledici = null;
        this.keyupHalledici = null;
        this.mousedownHalledici = null;
        this.fareDeKullan = fareDeKullan;
        this.fareElementi = fareElementi;
        if (wasdMi) {
            this.secilenTuslar = this.wasdTuslari;
        }
        else {
            this.secilenTuslar = this.okTuslari;
        }
        for (const kontrol in this.secilenTuslar) {
            let tuslar = this.secilenTuslar[kontrol];
            if (typeof tuslar === 'string') {
                tuslar = [tuslar];
            }
            for (const tus of tuslar) {
                if (this.secilenTuslarTersi[tus]) {
                    this.secilenTuslarTersi[tus].push(kontrol);
                }
                else {
                    this.secilenTuslarTersi[tus] = [kontrol];
                }
            }
        }
    }
    yonetmeyeBasla(kontroller) {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            if (kontroller) {
                this.kontroller = kontroller;
            }
            // böyle yapmanın sebebi hem thisi addeventlistenerde görmek hem de removeeventlistener yapabilmektir.
            this.keydownHalledici = (event) => {
                if (this.kontroller && !event.repeat) {
                    const baziKontroller = {};
                    if (event.key in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key].forEach(kontrol => {
                            baziKontroller[kontrol] = true;
                        });
                    }
                    if (event.key + '!' in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key + '!'].forEach(kontrol => {
                            baziKontroller[kontrol] = false;
                        });
                    }
                    this.kontrolGuncelle(baziKontroller);
                }
            };
            this.keyupHalledici = (event) => {
                if (this.kontroller && !event.repeat) {
                    const baziKontroller = {};
                    if (event.key in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key].forEach(kontrol => {
                            baziKontroller[kontrol] = false;
                        });
                    }
                    if (event.key + '!' in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key + '!'].forEach(kontrol => {
                            baziKontroller[kontrol] = true;
                        });
                    }
                    this.kontrolGuncelle(baziKontroller);
                }
            };
            this.mousedownHalledici = () => {
                const baziKontroller = {};
                baziKontroller.saldiri = true;
                this.kontrolGuncelle(baziKontroller);
            };
            window.addEventListener('keydown', this.keydownHalledici);
            window.addEventListener('keyup', this.keyupHalledici);
            if (this.fareDeKullan && this.fareElementi) {
                this.fareElementi.addEventListener('mousedown', this.mousedownHalledici);
            }
        }
    }
    yonetmeyiBirak() {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
            window.removeEventListener('keydown', this.keydownHalledici);
            window.removeEventListener('keyup', this.keyupHalledici);
            if (this.fareDeKullan && this.fareElementi) {
                this.fareElementi.removeEventListener('mousedown', this.mousedownHalledici);
            }
        }
    }
}
/**
 * mobil arayüzden gelen kontrollerle çalışır.
 */
export class MobilKontrolYoneticisi extends YayinciKontrolYoneticisi {
    constructor(galeAlinacakIsim, socket) {
        super(galeAlinacakIsim, socket);
    }
    yonetmeyeBasla(kontroller) {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            if (kontroller) {
                this.kontroller = kontroller;
            }
        }
    }
    yonetmeyiBirak() {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
        }
    }
}
export class UzaktanKontrolYoneticisi extends KontrolYoneticisi {
    constructor(socket, galeAlinacakIsim) {
        super(galeAlinacakIsim);
        this.oyunBilgisiHalledici = null;
        this.socket = socket;
    }
    yonetmeyeBasla(kontroller) {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            if (kontroller) {
                this.kontroller = kontroller;
            }
            this.oyunBilgisiHalledici = (oyunBilgisi) => {
                if (oyunBilgisi.isim === this.galeAlinacakIsim) {
                    this.kontrolGuncelle(oyunBilgisi.kontroller);
                }
            };
            this.socket.on('oyun bilgisi', this.oyunBilgisiHalledici);
        }
    }
    yonetmeyiBirak() {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
            this.socket.off('oyun bilgisi', this.oyunBilgisiHalledici);
        }
    }
}
export class Savasci {
    constructor(tuval, { renk = '', pozisyon = { x: 0, y: 0 }, sagaBakiyor = false, kontroller = {
        saldiri: false,
        taklaAt: false,
        solKosu: false,
        sonKosulanYonSagdir: false,
        sagKosu: false,
        zipla: false
    }, kontrolYoneticisi = null, genislik, yukseklik, isim, canCubuguID, canCubuguIsimID, spriteler, }) {
        this.hiz = { x: 0, y: 0 };
        this.ivme = { x: 0, y: 0 };
        this.yurumeIvmesi = { x: 0, y: 0 };
        this.taklaAtiyor = false;
        this.taklayiSagaAtiyor = false;
        this.sonHasarAlinanYonSagdir = false;
        this.hitKutusuOludur = false;
        this.yercekimiIvmesi = 0.098;
        this.ziplamaHizi = 6;
        this.yurumeHizi = 2;
        this.can = 100;
        this.kosuyor = false;
        this.saldiriHasari = 10;
        this.suanYapilanEylem = null;
        this.kanAkiyor = false;
        this.alternatifSaldiri = true; // surekli true false olur saldırdıkça
        this.tuval = tuval;
        this.hitKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, genislik, yukseklik, renk);
        this.kontroller = kontroller;
        this.kontrolYoneticisi = kontrolYoneticisi;
        if (this.kontrolYoneticisi) {
            this.kontrolYoneticisi.yonetmeyeBasla(this.kontroller);
        }
        this.isim = isim;
        this.canCubuguID = canCubuguID;
        this.canCubuguIsimID = canCubuguIsimID;
        this.sagaBakiyor = sagaBakiyor;
        document.getElementById(this.canCubuguIsimID).innerText = this.isim;
        this.silahKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, 193, 110, 'rgba(255,255,255,0.53)');
        this.spriteler = spriteler;
        this.sprite = this.sagaBakiyor ? this.spriteler.sag.rolanti : this.spriteler.sol.rolanti;
        this.sonluEylemler = ['zipla', 'taklaAt', 'saldiri1', 'saldiri2'];
        this.kanSpritesi = new Sprite(this.tuval, {
            resimKaynagi: './sprites/Blood FX Lite/JASONTOMLEE_BLOOD_GUSH_3.png',
            pozisyon: { x: 32, y: tuval.canvas.height - 111 },
            resimSayisi: 14,
            pozisyonOffset: { x: -30, y: -115 },
            skala: 1.5,
            isim: 'kan',
            kacSahnedeResimDegisir: 2,
            sonsuzAnimasyon: false,
        });
        Savasci.lar.push(this);
    }
    static savasciCikar(savasci) {
        var _a;
        const savasciIndeksi = Savasci.lar.indexOf(savasci);
        if (savasciIndeksi !== -1) {
            (_a = savasci.kontrolYoneticisi) === null || _a === void 0 ? void 0 : _a.yonetmeyiBirak();
            Savasci.lar.splice(savasciIndeksi, 1);
        }
    }
    silahYeriniAyarla() {
        this.silahKutusu.x = this.hitKutusu.x;
        this.silahKutusu.y = this.hitKutusu.y - 10;
        if (this.sagaBakiyor) {
            this.silahKutusu.x += this.hitKutusu.genislik - this.silahKutusu.genislik * 0.44;
        }
        else {
            this.silahKutusu.x += -this.silahKutusu.genislik + this.silahKutusu.genislik * 0.56;
        }
    }
    canCubuguGuncelle() {
        document.getElementById(this.canCubuguID).style.width = this.can + '%';
    }
    oludur() {
        return this.can <= 0;
    }
    zipla() {
        if (this.hitKutusu.yerdedir()) {
            this.hiz.y += -this.ziplamaHizi;
        }
        return this;
    }
    taklaAt() {
        if (!this.suanYapilanEylem) {
            this.taklaAtiyor = true;
            this.taklayiSagaAtiyor = this.sagaBakiyor;
            this.suanYapilanEylem = {
                spriteAdi: 'taklaAt',
            };
            this.hitKutusu.carpisabilir = false;
        }
    }
    // play mp3 file
    mp3Cal(fileName) {
        const audio = new Audio(`/${fileName}.mp3`);
        audio.play();
    }
    saldir() {
        if (!this.suanYapilanEylem) {
            /*this.mp3Cal('ahmet');*/
            if (this.alternatifSaldiri) {
                this.suanYapilanEylem = {
                    spriteAdi: 'saldiri2',
                };
            }
            else {
                this.suanYapilanEylem = {
                    spriteAdi: 'saldiri1',
                };
            }
            this.alternatifSaldiri = !this.alternatifSaldiri;
            Savasci.lar.forEach((savaskar) => {
                if (savaskar !== this && Dikdortgen.carpisir(this.silahKutusu, savaskar.hitKutusu)) {
                    savaskar.can = Math.max(0, savaskar.can - this.saldiriHasari);
                    savaskar.kanAkiyor = true;
                    savaskar.sonHasarAlinanYonSagdir = this.hitKutusu.merkezKordinat().x > savaskar.hitKutusu.x;
                    savaskar.canCubuguGuncelle();
                    console.log(savaskar.isim, savaskar.can);
                }
            });
        }
    }
    hareketEt() {
        if (this.kontroller.sagKosu && this.kontroller.sonKosulanYonSagdir) {
            this.sagaBakiyor = true;
        }
        if (this.kontroller.solKosu && !this.kontroller.sonKosulanYonSagdir) {
            this.sagaBakiyor = false;
        }
        // 3. durum: ikisi de false, oldugu gibi kalır yönü
        if (this.taklaAtiyor) {
            if (this.taklayiSagaAtiyor) {
                this.hitKutusu.x += this.tuval.gercekHiz(this.yurumeHizi);
            }
            else {
                this.hitKutusu.x -= this.tuval.gercekHiz(this.yurumeHizi);
            }
        }
        else {
            if (this.sagaBakiyor && this.kontroller.sagKosu) {
                this.hitKutusu.x += this.tuval.gercekHiz(this.yurumeHizi);
            }
            else if (!this.sagaBakiyor && this.kontroller.solKosu) {
                this.hitKutusu.x -= this.tuval.gercekHiz(this.yurumeHizi);
            }
        }
        this.hitKutusu.x += this.tuval.gercekHiz(this.hiz.x);
        this.hitKutusu.y += this.tuval.gercekHiz(this.hiz.y);
        if (this.hitKutusu.yerdedir()) {
            this.hitKutusu.y = this.tuval.yerKordinati - this.hitKutusu.yukseklik;
            this.hiz.y = 0;
        }
        this.hiz.y += this.tuval.gercekHiz(this.ivme.y + this.yercekimiIvmesi + this.yurumeIvmesi.y);
        this.hiz.x += this.tuval.gercekHiz(this.ivme.x + this.yurumeIvmesi.x);
        return this;
    }
    munasipSpriteSec() {
        const yonluSpriteler = this.sagaBakiyor ? this.spriteler.sag : this.spriteler.sol;
        if (this.oludur()) {
            if (this.sprite.isim != 'oldu') {
                if (this.sonHasarAlinanYonSagdir) {
                    this.sprite = this.spriteler.sag.oldu;
                }
                else {
                    this.sprite = this.spriteler.sol.oldu;
                }
            }
        }
        else {
            /**
             * sprite animasyonu bitimi burasıdır.
             */
            if (this.sprite && this.sprite.birKereTamAnimasyonOldu && this.sonluEylemler.includes(this.sprite.isim)) {
                switch (this.sprite.isim) {
                    case 'saldiri1':
                    case 'saldiri2':
                        this.kontroller.saldiri = false;
                        break;
                    case 'taklaAt':
                        this.hitKutusu.carpisabilir = true;
                        this.taklaAtiyor = false;
                        this.kontroller.taklaAt = false;
                        break;
                    case 'zipla':
                        this.kontroller.zipla = false;
                        break;
                }
                this.suanYapilanEylem = null;
                this.sprite.birKereTamAnimasyonOldu = false;
            }
            if (this.suanYapilanEylem) {
                if (this.sprite.isim !== this.suanYapilanEylem.spriteAdi) {
                    this.sprite = yonluSpriteler[this.suanYapilanEylem.spriteAdi];
                    this.sprite.animasyonBasaSar();
                }
            }
            else { // pasif spriteler. eylem yapılınca bunlar gözükmez.
                if (!this.hitKutusu.yerdedir()) {
                    if (this.hiz.y <= 0) {
                        this.sprite = yonluSpriteler.zipla;
                    }
                    else {
                        this.sprite = yonluSpriteler.dusus;
                    }
                }
                else {
                    if (this.sagaBakiyor && this.kontroller.sagKosu || !this.sagaBakiyor && this.kontroller.solKosu) {
                        if ((this.sprite.isim == 'kosu' && (this.sprite.yonuSagdir != this.sagaBakiyor)) ||
                            this.sprite.isim == 'donme') {
                            if (this.sprite.isim == 'donme' && this.sprite.birKereTamAnimasyonOldu) {
                                this.spriteler.sol.donme.animasyonBasaSar();
                                this.spriteler.sag.donme.animasyonBasaSar();
                                this.sprite = yonluSpriteler.kosu;
                            }
                            else {
                                if (this.sagaBakiyor) {
                                    this.sprite = this.spriteler.sol.donme;
                                }
                                else {
                                    this.sprite = this.spriteler.sag.donme;
                                }
                            }
                        }
                        else {
                            this.sprite = yonluSpriteler.kosu;
                        }
                    }
                    else {
                        this.sprite = yonluSpriteler.rolanti;
                    }
                }
            }
        }
        return this;
    }
    spritePozisyonAyarlaHitKutusunaGore(sprite) {
        sprite.pozisyon.y = this.hitKutusu.y;
        sprite.pozisyon.x = this.hitKutusu.x;
        return this;
    }
    oluHitKutusuYap() {
        const uzunKenar = this.hitKutusu.yukseklik;
        const kisaKenar = this.hitKutusu.genislik;
        this.hitKutusu.genislik = uzunKenar;
        this.hitKutusu.yukseklik = kisaKenar / 2;
        this.hitKutusu.y += uzunKenar - kisaKenar + this.hitKutusu.yukseklik;
        if (this.sonHasarAlinanYonSagdir) {
            this.hitKutusu.x -= kisaKenar * 1.5;
            this.spriteler.sag.oldu.pozisyonOffset = { x: -47, y: -165 - this.hitKutusu.yukseklik };
        }
        else {
            this.hitKutusu.x += kisaKenar;
            this.spriteler.sol.oldu.pozisyonOffset = { x: -180, y: -165 - this.hitKutusu.yukseklik };
        }
        this.hitKutusuOludur = true;
    }
    guncelle() {
        /*this.hitKutusu.ciz();
        this.silahKutusu.ciz();*/
        if (this.kanAkiyor) {
            this.spritePozisyonAyarlaHitKutusunaGore(this.kanSpritesi);
            this.kanSpritesi.guncelle();
            if (this.kanSpritesi.birKereTamAnimasyonOldu) {
                this.kanAkiyor = false;
                this.kanSpritesi.animasyonBasaSar();
            }
        }
        if (this.kontroller.zipla) {
            this.zipla();
        }
        if (this.kontroller.taklaAt) {
            this.taklaAt();
        }
        if (!this.oludur()) {
            if (this.kontroller.saldiri) {
                this.saldir();
            }
        }
        this.hareketEt();
        this.silahYeriniAyarla();
        this.munasipSpriteSec();
        this.spritePozisyonAyarlaHitKutusunaGore(this.sprite);
        this.sprite.guncelle();
        if (this.oludur() && this.sprite.isim == 'oldu' && this.sprite.birKereTamAnimasyonOldu && !this.hitKutusuOludur) {
            this.oluHitKutusuYap();
        }
        return this;
    }
}
Savasci.lar = [];
//# sourceMappingURL=oyn.js.map