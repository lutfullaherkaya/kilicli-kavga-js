/**
 * @jest-environment jsdom
 */

class Tuval {
    constructor(canvas, genislik, yukseklik) {
        this.canvas = canvas;
        this.canvas.width = genislik;
        this.canvas.height = yukseklik;
        this.c = this.canvas.getContext('2d');
        this.temizle();
    }

    temizle() {

        this.c.fillStyle = 'black';
        this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
        return this.y >= this.tuval.canvas.height - this.yukseklik;
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

class Sprite {
    static ler = [];

    constructor(
        tuval, { renk, pozisyon, hiz, ivme, solTusu, sagTusu, saldiriTusu, basilanTuslar, genislik, yukseklik, isim}) {
        this.tuval = tuval;
        this.hitKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, genislik, yukseklik, renk);
        this.hiz = hiz;
        this.ivme = ivme; // yercekimi haric
        this.yurumeIvmesi = { x: 0, y: 0 };
        this.solTusu = solTusu;
        this.sagTusu = sagTusu;
        this.saldiriTusu = saldiriTusu;
        this.isim = isim;

        this.basilanTuslar = basilanTuslar;

        this.yercekimiIvmesi = 0.098;
        this.ziplamaHizi = 6;
        this.yurumeHizi = 2;
        this.can = 100;
        this.sagaBakiyor = false;
        this.silahKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, 50, 10, 'white');
        this.saldiriHasari = 10;

        Sprite.ler.push(this);
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
        Sprite.ler.forEach((sprite1) => {
            Sprite.ler.forEach((sprite2) => {
                if (sprite1 !== sprite2) {
                    sprite1.carpismayacakKadarOtele(sprite2);
                }
            });
        });
    }

    /**
     * This nesnesini öteler, spriteyi değil.
     * @param sprite
     */
    carpismayacakKadarOtele(sprite) {
        if (Dikdortgen.carpisir(this.hitKutusu, sprite.hitKutusu)) {
            if (Math.abs(this.hitKutusu.merkezKordinat().y - sprite.hitKutusu.merkezKordinat().y) <
                Math.abs(this.hitKutusu.merkezKordinat().x - sprite.hitKutusu.merkezKordinat().x)) {
                this.yataydaKenarinaOtele(sprite);
                this.ivme.x = 0;
                this.hiz.x = 0;
            }
            else {
                this.duseydeKenarinaOtele(sprite);
                this.hiz.y = 0;
                this.ivme.y = 0;
            }
        }
    }

    duseydeKenarinaOtele(sprite) {
        if (this.hitKutusu.merkezKordinat().y < sprite.hitKutusu.merkezKordinat().y) { // yukarisinda olacak
            this.hitKutusu.y = sprite.hitKutusu.y - this.hitKutusu.yukseklik;
        }
        else if (this.hitKutusu.merkezKordinat().y >= sprite.hitKutusu.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = sprite.hitKutusu.y + sprite.yukseklik;
            if (yeniYPozisyonu < this.tuval.canvas.height - this.hitKutusu.yukseklik) {
                this.hitKutusu.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    yataydaKenarinaOtele(sprite) {
        if (this.hitKutusu.merkezKordinat().x < sprite.hitKutusu.merkezKordinat().x) { // solunda olacak
            this.hitKutusu.x = sprite.hitKutusu.x - this.hitKutusu.genislik;
        }
        else if (this.hitKutusu.merkezKordinat().x > sprite.hitKutusu.merkezKordinat().x) { // saginda olacak
            this.hitKutusu.x = sprite.hitKutusu.x + sprite.hitKutusu.genislik;
        }
    }

    zipla() {
        if (this.hitKutusu.yerdedir()) {
            this.hiz.y += -this.ziplamaHizi;
        }
        return this;
    }

    saldir() {
        Sprite.ler.forEach((sprite) => {
            if (sprite !== this && Dikdortgen.carpisir(this.silahKutusu, sprite.hitKutusu)) {
                sprite.can--;
                console.log(sprite.isim, sprite.can);
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
        this.hitKutusu.x += this.hiz.x + ((this.basilanTuslar[this.sagTusu] ? this.yurumeHizi : 0) +
            (this.basilanTuslar[this.solTusu] ? -this.yurumeHizi : 0));
        this.hitKutusu.y += this.hiz.y;
        if (this.hitKutusu.yerdedir()) {
            this.hitKutusu.y = this.tuval.canvas.height - this.hitKutusu.yukseklik;
            this.hiz.y = 0;
        }
        this.hiz.y += this.ivme.y + this.yercekimiIvmesi + this.yurumeIvmesi.y;
        this.hiz.x += this.ivme.x + this.yurumeIvmesi.x;

        return this;
    }

    guncelle() {
        this.hitKutusu.ciz();
        this.hareketEt();
        this.silahYeriniAyarla();
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

    const tuval = new Tuval(document.querySelector('canvas'), 800, 600);
    const oyuncu = new Sprite(tuval, {
        renk: '#ff0000',
        pozisyon: { x: 32, y: tuval.canvas.height - 111 },
        hiz: { x: 0, y: 0 },
        ivme: { x: 0, y: 0 },
        solTusu: 'ArrowLeft',
        sagTusu: 'ArrowRight',
        saldiriTusu: 'ArrowDown',
        genislik: 150,
        yukseklik: 66,
        basilanTuslar,
        isim: 'lutfullah'
    });
    const oyuncu2 = new Sprite(tuval, {
        renk: 'purple',
        pozisyon: { x: 320, y: 0 },
        hiz: { x: 0, y: 0 },
        ivme: { x: 0, y: 0 },
        solTusu: 'a',
        sagTusu: 'd',
        saldiriTusu: ' ',
        genislik: 50,
        yukseklik: 100,
        basilanTuslar,
        isim: 'o'
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
        oyuncu.guncelle();
        oyuncu2.guncelle();
        Sprite.carpismaEngelle();
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

