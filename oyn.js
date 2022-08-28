/**
 * @jest-environment jsdom
 */
/**
 * todo: oyun hızı fps'ye bağımlı olmasın
 */
class Tuval {
    constructor(canvas, genislik, yukseklik, yerKordianti) {
        this.canvas = canvas;
        this.canvas.width = genislik;
        this.canvas.height = yukseklik;
        this.yerKordinati = yerKordianti;
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.temizle();

    }

    temizle() {
        this.context.fillStyle = '#0b2e2f';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setZamanKutucugu(sayi) {
        document.getElementById('zaman').innerText = sayi;
    }
}

class Dikdortgen {
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
            pozisyon = { x: 0, y: 0 },
            pozisyonOffset = { x: 0, y: 0 },
            resimKaynagi,
            skala = 1,
            resimSayisi = 1,
            sonsuzAnimasyon = true,
            isim,
        }) {
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
        this.resim.classList.add('pixel-art-image');
        this.resimSayisi = resimSayisi;

        this.kacSahnedeResimDegisir = 10;
        this.suankiSahne = 0;
        this.birKereTamAnimasyonOldu = false;
    }

    ciz() {
        this.tuval.context.drawImage(
            this.resim,
            (this.suankiResim % this.resimSayisi) * (this.resim.width / this.resimSayisi),
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
        if (this.suankiResim === this.resimSayisi) {
            this.birKereTamAnimasyonOldu = true;
        }
        if (this.sonsuzAnimasyon || !this.birKereTamAnimasyonOldu) {
            this.ciz();
        }
        if (this.suankiSahne === 0) {
            this.suankiResim++;
        }
        this.suankiSahne = (this.suankiSahne + 1) % this.kacSahnedeResimDegisir;

        return this;
    }

}

class SavasciCarpisma {
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
     * @param savaskar1 ötelenecek nesne
     * @param savaskar2
     */
    static carpismayacakKadarOtele(savaskar1, savaskar2) {
        if (Dikdortgen.carpisir(savaskar1.hitKutusu, savaskar2.hitKutusu)) {
            if (Math.abs(savaskar1.hitKutusu.merkezKordinat().y - savaskar2.hitKutusu.merkezKordinat().y) <
                Math.abs(savaskar1.hitKutusu.merkezKordinat().x - savaskar2.hitKutusu.merkezKordinat().x)) {
                SavasciCarpisma.yataydaKenarinaOtele(savaskar1, savaskar2);
                savaskar1.ivme.x = 0;
                savaskar1.hiz.x = 0;
            }
            else {
                SavasciCarpisma.duseydeKenarinaOtele(savaskar1, savaskar2);
                savaskar1.hiz.y = 0;
                savaskar1.ivme.y = 0;
            }
        }
    }

    static duseydeKenarinaOtele(savaskar1, savaskar2) {
        if (savaskar1.hitKutusu.merkezKordinat().y < savaskar2.hitKutusu.merkezKordinat().y) { // yukarisinda olacak
            savaskar1.hitKutusu.y = savaskar2.hitKutusu.y - savaskar1.hitKutusu.yukseklik;
        }
        else if (savaskar1.hitKutusu.merkezKordinat().y >= savaskar2.hitKutusu.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savaskar2.hitKutusu.y + savaskar2.yukseklik;
            if (yeniYPozisyonu < savaskar1.tuval.yerKordinati - savaskar1.hitKutusu.yukseklik) {
                savaskar1.hitKutusu.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    static yataydaKenarinaOtele(savaskar1, savaskar2) {
        if (savaskar1.hitKutusu.merkezKordinat().x < savaskar2.hitKutusu.merkezKordinat().x) { // solunda olacak
            savaskar1.hitKutusu.x = savaskar2.hitKutusu.x - savaskar1.hitKutusu.genislik;
        }
        else if (savaskar1.hitKutusu.merkezKordinat().x > savaskar2.hitKutusu.merkezKordinat().x) { // saginda olacak
            savaskar1.hitKutusu.x = savaskar2.hitKutusu.x + savaskar2.hitKutusu.genislik;
        }
    }
}

class Savasci {
    static lar = [];

    constructor(
        tuval, {
            renk,
            pozisyon,
            sagaBakiyor,
            solTusu,
            sagTusu,
            saldiriTusu,
            basilanTuslar,
            genislik,
            yukseklik,
            isim,
            canCubuguID,
            canCubuguIsimID,
            spriteler,
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
        this.sagaBakiyor = sagaBakiyor;

        document.getElementById(this.canCubuguIsimID).innerText = this.isim;

        this.basilanTuslar = basilanTuslar;

        this.yercekimiIvmesi = 0.098;
        this.ziplamaHizi = 6;
        this.yurumeHizi = 2;
        this.can = 100;

        this.kosuyor = false;
        this.silahKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, 193, 110, 'rgba(255,255,255,0.53)');
        this.saldiriHasari = 10;
        this.spriteler = spriteler;
        this.sprite = null;

        this.sonluEylemler = ['zipla', 'taklaAt', 'saldiri1', 'saldiri2'];
        this.suanYapilanEylem = null;

        // surekli true false olur saldırdıkça
        this.alternatifSaldiri = true;

        Savasci.lar.push(this);
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

    zipla() {
        if (this.hitKutusu.yerdedir()) {
            this.hiz.y += -this.ziplamaHizi;
        }
        return this;
    }

    taklaAt() {
        if (!this.suanYapilanEylem) {
            this.suanYapilanEylem = {
                eylem: 'taklaAt',
                spriteAdi: 'taklaAt',
            };
            this.hitKutusu.carpisabilir = false;
        }
    }

    saldir() {
        if (!this.suanYapilanEylem) {
            if (this.alternatifSaldiri) {
                this.suanYapilanEylem = {
                    eylem: 'saldiri2',
                    spriteAdi: 'saldiri2',
                };
            }
            else {
                this.suanYapilanEylem = {
                    eylem: 'saldiri1',
                    spriteAdi: 'saldiri1',
                };
            }
            this.alternatifSaldiri = !this.alternatifSaldiri;
            Savasci.lar.forEach((savaskar) => {
                if (savaskar !== this && Dikdortgen.carpisir(this.silahKutusu, savaskar.hitKutusu)) {
                    savaskar.can -= this.saldiriHasari;
                    savaskar.canCubuguGuncelle();
                    console.log(savaskar.isim, savaskar.can);
                }
            })
        }

    }

    hareketEt() {
        if (this.basilanTuslar[this.sagTusu]) {
            this.sagaBakiyor = true;
        }
        if (this.basilanTuslar[this.solTusu]) {
            this.sagaBakiyor = false;
        }
        this.kosuyor = this.basilanTuslar[this.sagTusu] || this.basilanTuslar[this.solTusu];
        if (this.basilanTuslar[this.sagTusu] && this.basilanTuslar[this.solTusu]) {
            this.yuruyor = false;
        }

        if (this.kosuyor) {
            if (this.sagaBakiyor) {
                this.hitKutusu.x += this.yurumeHizi;
            }
            else {
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

        return this;
    }

    munasipSpriteSec() {
        let yonluSpriteler = this.sagaBakiyor ? this.spriteler.sag : this.spriteler.sol;

        /**
         * sprite animasyonu bitimi burasıdır. mesela zıplarken peşisıra gelecek animasyon vs. burada seçilir.
         */
        if (this.sprite && this.sprite.birKereTamAnimasyonOldu && this.sonluEylemler.includes(this.sprite.isim)) {
            if (this.sprite.isim == 'taklaAt') {
                this.hitKutusu.carpisabilir = true;
            }
            this.suanYapilanEylem = null;
            this.sprite.birKereTamAnimasyonOldu = false;
        }

        if (this.suanYapilanEylem) {
            if (this.sprite.isim !== this.suanYapilanEylem.spriteAdi) {
                this.sprite = yonluSpriteler[this.suanYapilanEylem.spriteAdi];
                this.sprite.suankiResim = 0;
                this.sprite.suankiSahne = 0;
            }

        }
        else {
            if (!this.hitKutusu.yerdedir()) {
                if (this.hiz.y <= 0) {
                    this.sprite = yonluSpriteler.zipla;
                }
                else {
                    this.sprite = yonluSpriteler.dusus;

                }
            }
            else {
                if (this.kosuyor) {
                    this.sprite = yonluSpriteler.kosu;
                }
                else {
                    this.sprite = yonluSpriteler.rolanti;
                }
            }

        }

        return this;
    }

    spritePozisyonAyarlaHitKutusunaGore() {
        this.sprite.pozisyon.y = this.hitKutusu.y;
        this.sprite.pozisyon.x = this.hitKutusu.x;
        return this;
    }

    guncelle() {
        this.hareketEt();
        this.silahYeriniAyarla();

        this.munasipSpriteSec().spritePozisyonAyarlaHitKutusunaGore();
        this.sprite.guncelle();

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
    const oyuncu = new Savasci(tuval, {
        renk: 'rgba(255,0,0,0.5)',
        pozisyon: { x: 32, y: tuval.canvas.height - 111 },
        sagaBakiyor: true,
        solTusu: 'ArrowLeft',
        sagTusu: 'ArrowRight',
        saldiriTusu: 'ArrowDown',
        genislik: 50,
        yukseklik: 100,
        basilanTuslar,
        isim: 'lutfullah',
        canCubuguID: 'ic-can-cubugu-1',
        canCubuguIsimID: 'can-cubugu-isim-1',
        spriteler: {
            sol: {
                rolanti: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Idle.png',
                    pozisyon: { x: 32, y: tuval.canvas.height - 111 },
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'rolanti',
                }),
                kosu: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Run.png',
                    pozisyon: { x: 32, y: tuval.canvas.height - 111 },
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'kosu',
                }),
                taklaAt: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Roll.png',
                    resimSayisi: 12,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'taklaAt',
                }),
                zipla: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Jump.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'zipla',
                }),

                dusus: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Fall.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'dusus',
                }),
                saldiri1: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_AttackNoMovement.png',
                    resimSayisi: 4,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri1',
                }),
                saldiri2: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Attack2NoMovement.png',
                    resimSayisi: 6,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri2',
                }),
            },
            sag: {
                rolanti: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Idle.png',
                    pozisyon: { x: 32, y: tuval.canvas.height - 111 },
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'rolanti',
                }),
                kosu: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Run.png',
                    pozisyon: { x: 32, y: tuval.canvas.height - 111 },
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'kosu',
                }),
                taklaAt: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Roll.png',
                    resimSayisi: 12,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'taklaAt',
                }),
                zipla: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Jump.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'zipla',
                }),

                dusus: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Fall.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'dusus',
                }),
                saldiri1: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_AttackNoMovement.png',
                    resimSayisi: 4,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri1',
                }),
                saldiri2: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Attack2NoMovement.png',
                    resimSayisi: 6,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri2',
                }),
            },
        },
    });
    const oyuncu2 = new Savasci(tuval, {
        renk: 'rgba(255,0,0,0.5)',
        pozisyon: { x: 320, y: 0 },
        sagaBakiyor: false,
        solTusu: 'a',
        sagTusu: 'd',
        saldiriTusu: ' ',
        genislik: 50,
        yukseklik: 100,
        basilanTuslar,
        isim: 'o',
        canCubuguID: 'ic-can-cubugu-2',
        canCubuguIsimID: 'can-cubugu-isim-2',
        spriteler: {
            sol: {
                rolanti: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Idle.png',
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'rolanti',
                }),
                kosu: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Run.png',
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'kosu',
                }),
                taklaAt: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Roll.png',
                    resimSayisi: 12,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'taklaAt',
                }),
                zipla: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Jump.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'zipla',
                }),

                dusus: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Fall.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'dusus',
                }),
                saldiri1: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_AttackNoMovement.png',
                    resimSayisi: 4,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri1',
                }),
                saldiri2: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Attack2NoMovement.png',
                    resimSayisi: 6,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri2',
                }),

            },
            sag: {
                rolanti: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Idle.png',
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'rolanti',
                }),
                kosu: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Run.png',
                    resimSayisi: 10,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'kosu',
                }),
                taklaAt: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Roll.png',
                    resimSayisi: 12,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'taklaAt',
                }),
                zipla: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Jump.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    sonsuzAnimasyon: false,
                    isim: 'zipla',
                }),
                dusus: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Fall.png',
                    resimSayisi: 3,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'dusus',
                }),
                saldiri1: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_AttackNoMovement.png',
                    resimSayisi: 4,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri1',
                }),
                saldiri2: new Sprite(tuval, {
                    resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Attack2NoMovement.png',
                    resimSayisi: 6,
                    pozisyonOffset: { x: -122, y: -115 },
                    skala: 1,
                    isim: 'saldiri2',
                }),
            },
        },
    });

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                oyuncu2.zipla();
                break;
            case 'ArrowUp':
                oyuncu.zipla();
                break;
            case 'Shift':
                oyuncu2.taklaAt();
                break;
            case 'ö':
                oyuncu.taklaAt();
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
        SavasciCarpisma.engelle();
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

