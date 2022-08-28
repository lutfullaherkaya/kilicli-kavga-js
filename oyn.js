/**
 * @jest-environment jsdom
 */

class Tuval {
    constructor(canvas, genislik, yukseklik, yerKordianti) {
        this.canvas = canvas;
        this.canvas.width = genislik;
        this.canvas.height = yukseklik;
        this.yerKordinati = yerKordianti;
        this.c = this.canvas.getContext('2d');
        this.temizle();

    }

    temizle() {
        this.c.fillStyle = '#0b2e2f';
        this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setZamanKutucugu(sayi) {
        document.getElementById('zaman').innerText = sayi;
    }
}

class Dikdortgen {
    constructor(tuval, x, y, genislik, yukseklik, renk) {
        this.tuval = tuval;
        this.x = x;
        this.y = y;
        this.genislik = genislik;
        this.yukseklik = yukseklik;
        this.renk = renk;
    }

    ciz() {
        this.tuval.c.fillStyle = this.renk;
        this.tuval.c.fillRect(this.x, this.y, this.genislik, this.yukseklik);
    }

    yerdedir() {
        return this.y + this.yukseklik >= this.tuval.yerKordinati;
    }

    static carpisir(dikdortgen1, dikdortgen2) {
        return !dikdortgen1.solundadir(dikdortgen2) &&
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
        }
    }

}

/**
 * Bu hocama teşekkürler grafik için
 * https://aamatniekss.itch.io/fantasy-knight-free-pixelart-animated-character
 *
 */
class Sprite {
    constructor(
        tuval, {
            pozisyon,
            pozisyonOffset = { x: 0, y: 0 },
            resimKaynagi,
            skala = 1,
            resimSayisi = 1,
        }) {
        this.tuval = tuval;
        this.pozisyon = pozisyon;
        this.pozisyonOffset = pozisyonOffset;
        this.resimSayisi = resimSayisi;
        this.suankiResim = 0;
        this.skala = skala;

        this.setResim(resimKaynagi);

        this.kacSahnedeResimDegisir = 10;
        this.suankiSahne = 0;
    }

    setResim(resimKaynagi, resimSayisi, suankiResim) {
        if (!(this.resim && this.resim.src && this.resim.src == resimKaynagi)) {
            this.resim = new Image();
            this.resim.src = resimKaynagi;
        }
        if (resimSayisi !== undefined) {
            this.resimSayisi = resimSayisi;
        }
        if (suankiResim !== undefined) {
            this.suankiResim = suankiResim;
        }


    }

    ciz() {

        this.tuval.c.drawImage(
            this.resim,
            this.suankiResim * (this.resim.width / this.resimSayisi),
            0,
            this.resim.width / this.resimSayisi,
            this.resim.height,
            this.pozisyon.x + this.pozisyonOffset.x,
            this.pozisyon.y + this.pozisyonOffset.y,
            (this.resim.width / this.resimSayisi) * this.skala,
            this.resim.height * this.skala);
        return this;
    }

    guncelle() {
        this.suankiResim = this.suankiResim % this.resimSayisi; // farklı resim gelip de suanki resim indeks dışına çıkarsa diye
        this.ciz();
        if (this.suankiSahne === 0) {
            this.suankiResim = (this.suankiResim + 1) % this.resimSayisi;
        }
        this.suankiSahne = (this.suankiSahne + 1) % this.kacSahnedeResimDegisir;

        return this;
    }

}

class Savaskar {
    static lar = [];

    constructor(
        tuval, {
            renk,
            pozisyon,
            solTusu,
            sagTusu,
            saldiriTusu,
            basilanTuslar,
            genislik,
            yukseklik,
            isim,
            canCubuguID,
            canCubuguIsimID
        }) {
        this.tuval = tuval;
        this.hitKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, genislik, yukseklik, renk);
        this.hiz = { x: 0, y: 0 };
        this.ivme = { x: 0, y: 0 }; // yercekimi haric
        this.yurumeIvmesi = { x: 0, y: 0 };
        this.solTusu = solTusu;
        this.sagTusu = sagTusu;
        this.saldiriTusu = saldiriTusu;
        this.isim = isim;
        this.canCubuguID = canCubuguID;
        this.canCubuguIsimID = canCubuguIsimID;

        document.getElementById(this.canCubuguIsimID ).innerText = this.isim;

        this.basilanTuslar = basilanTuslar;

        this.yercekimiIvmesi = 0.098;
        this.ziplamaHizi = 6;
        this.yurumeHizi = 2;
        this.can = 100;
        this.sagaBakiyor = false;
        this.kosuyor = false;
        this.silahKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, 50, 10, 'white');
        this.saldiriHasari = 10;

        this.idleResimSag = './sprites/FreeKnight_v1/Colour1/NoOutline/480x320_PNGSheets/_Idle_right.png';
        this.idleResimSol = './sprites/FreeKnight_v1/Colour1/NoOutline/480x320_PNGSheets/_Idle_left.png';
        this.idleResimSayisi = 10;
        this.runResimSag = './sprites/FreeKnight_v1/Colour1/NoOutline/480x320_PNGSheets/_Run_right.png';
        this.runResimSol = './sprites/FreeKnight_v1/Colour1/NoOutline/480x320_PNGSheets/_Run_left.png';
        this.runResimSayisi = 10;
        this.sprite = new Sprite(this.tuval, {
            pozisyon: pozisyon,
            pozisyonOffset: { x: -122, y: -115 },
            resimKaynagi: this.sagaBakiyor ? this.idleResimSag : this.idleResimSol,
            skala: 0.675,
            resimSayisi: this.idleResimSayisi
        });

        Savaskar.lar.push(this);
    }

    silahYeriniAyarla() {
        this.silahKutusu.x = this.hitKutusu.x;
        this.silahKutusu.y = this.hitKutusu.y + this.hitKutusu.yukseklik / 2;

        if (this.sagaBakiyor) {
            this.silahKutusu.x += this.hitKutusu.genislik;
        }
        else {
            this.silahKutusu.x -= this.silahKutusu.genislik;
        }
    }

    static carpismaEngelle() {
        Savaskar.lar.forEach((savaskar1) => {
            Savaskar.lar.forEach((savaskar2) => {
                if (savaskar1 !== savaskar2) {
                    savaskar1.carpismayacakKadarOtele(savaskar2);
                }
            });
        });
    }

    /**
     * This nesnesini öteler, spriteyi değil.
     * @param sprite
     */
    carpismayacakKadarOtele(savaskar) {
        if (Dikdortgen.carpisir(this.hitKutusu, savaskar.hitKutusu)) {
            if (Math.abs(this.hitKutusu.merkezKordinat().y - savaskar.hitKutusu.merkezKordinat().y) <
                Math.abs(this.hitKutusu.merkezKordinat().x - savaskar.hitKutusu.merkezKordinat().x)) {
                this.yataydaKenarinaOtele(savaskar);
                this.ivme.x = 0;
                this.hiz.x = 0;
            }
            else {
                this.duseydeKenarinaOtele(savaskar);
                this.hiz.y = 0;
                this.ivme.y = 0;
            }
        }
    }

    duseydeKenarinaOtele(savaskar) {
        if (this.hitKutusu.merkezKordinat().y < savaskar.hitKutusu.merkezKordinat().y) { // yukarisinda olacak
            this.hitKutusu.y = savaskar.hitKutusu.y - this.hitKutusu.yukseklik;
        }
        else if (this.hitKutusu.merkezKordinat().y >= savaskar.hitKutusu.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savaskar.hitKutusu.y + savaskar.yukseklik;
            if (yeniYPozisyonu < this.tuval.yerKordinati - this.hitKutusu.yukseklik) {
                this.hitKutusu.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    yataydaKenarinaOtele(savaskar) {
        if (this.hitKutusu.merkezKordinat().x < savaskar.hitKutusu.merkezKordinat().x) { // solunda olacak
            this.hitKutusu.x = savaskar.hitKutusu.x - this.hitKutusu.genislik;
        }
        else if (this.hitKutusu.merkezKordinat().x > savaskar.hitKutusu.merkezKordinat().x) { // saginda olacak
            this.hitKutusu.x = savaskar.hitKutusu.x + savaskar.hitKutusu.genislik;
        }
    }

    zipla() {
        if (this.hitKutusu.yerdedir()) {
            this.hiz.y += -this.ziplamaHizi;
        }
        return this;
    }

    canCubuguGuncelle() {
        document.getElementById(this.canCubuguID).style.width = this.can + '%';
    }

    saldir() {
        Savaskar.lar.forEach((savaskar) => {
            if (savaskar !== this && Dikdortgen.carpisir(this.silahKutusu, savaskar.hitKutusu)) {
                savaskar.can--;
                savaskar.canCubuguGuncelle();
                console.log(savaskar.isim, savaskar.can);
            }
        })
    }

    hareketEt() {
        if (this.basilanTuslar[this.sagTusu]) {
            this.sagaBakiyor = true;
        }
        if (this.basilanTuslar[this.solTusu]) {
            this.sagaBakiyor = false;
        }
        this.yuruyor = this.basilanTuslar[this.sagTusu] || this.basilanTuslar[this.solTusu];
        if (this.basilanTuslar[this.sagTusu] && this.basilanTuslar[this.solTusu]) {
            this.yuruyor = false;
        }

        if (this.yuruyor) {
            if (this.sagaBakiyor) {
                this.hitKutusu.x += this.yurumeHizi;
            } else {
                this.hitKutusu.x -= this.yurumeHizi;
            }
        }

        this.hitKutusu.x += this.hiz.x;
        this.hitKutusu.y += this.hiz.y;


        if (this.hitKutusu.yerdedir()) {
            this.hitKutusu.y = this.tuval.yerKordinati - this.hitKutusu.yukseklik;
            this.hiz.y = 0;
        }
        this.hiz.y += this.ivme.y + this.yercekimiIvmesi + this.yurumeIvmesi.y;
        this.hiz.x += this.ivme.x + this.yurumeIvmesi.x;
        this.sprite.pozisyon.y = this.hitKutusu.y;
        this.sprite.pozisyon.x = this.hitKutusu.x;

        return this;
    }

    munasipSpriteAyarla() {
        if (this.yuruyor) {
            this.sprite.setResim(this.sagaBakiyor ? this.runResimSag : this.runResimSol);
        } else {
            this.sprite.setResim(this.sagaBakiyor ? this.idleResimSag : this.idleResimSol);
        }

        this.sprite.guncelle();
    }

    guncelle() {
        this.hitKutusu.ciz();
        this.hareketEt();
        this.silahYeriniAyarla();

        this.munasipSpriteAyarla();

        if (this.basilanTuslar[this.saldiriTusu]) {
            this.silahKutusu.ciz();
        }
        if (this.basilanTuslar[this.saldiriTusu] && !this.saldirildi) {
            this.saldir();
        }
        this.saldirildi = Boolean(this.basilanTuslar[this.saldiriTusu]);
        return this;
    }


}

function main() {
    const basilanTuslar = {}

    const tuval = new Tuval(document.querySelector('canvas'), 800, 600, 480);
    const arkaplan = new Sprite(tuval, {
        pozisyon: {
            x: 0,
            y: 0,
        },
        resimKaynagi: './sprites/NightForest/Image without mist.png',
        skala: 1.67,
    });
    const oyuncu = new Savaskar(tuval, {
        renk: 'rgba(255,0,0,0)',
        pozisyon: { x: 32, y: tuval.canvas.height - 111 },
        solTusu: 'ArrowLeft',
        sagTusu: 'ArrowRight',
        saldiriTusu: 'ArrowDown',
        genislik: 50,
        yukseklik: 100,
        basilanTuslar,
        isim: 'lutfullah',
        canCubuguID: 'ic-can-cubugu-1',
        canCubuguIsimID: 'can-cubugu-isim-1'
    });
    const oyuncu2 = new Savaskar(tuval, {
        renk: 'rgba(255,0,0,0)',
        pozisyon: { x: 320, y: 0 },
        solTusu: 'a',
        sagTusu: 'd',
        saldiriTusu: ' ',
        genislik: 50,
        yukseklik: 100,
        basilanTuslar,
        isim: 'o',
        canCubuguID: 'ic-can-cubugu-2',
        canCubuguIsimID: 'can-cubugu-isim-2'
    });

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                oyuncu2.zipla();
                break;
            case 'ArrowUp':
                oyuncu.zipla();
                break;
            default:
                basilanTuslar[event.key] = true;
        }
    });
    window.addEventListener('keyup', (event) => {
        basilanTuslar[event.key] = false;
    });

    function canlandir() {
        window.requestAnimationFrame(canlandir);
        tuval.temizle();
        arkaplan.guncelle();
        oyuncu.guncelle();
        oyuncu2.guncelle();
        Savaskar.carpismaEngelle();
    }

    canlandir();
}

if (typeof require === 'undefined') { // tarayicida calisacak, testte degil
    main();
}
else {
    module.exports = {
        Tuval: Tuval,
        Sprite: Sprite,
    }
}

