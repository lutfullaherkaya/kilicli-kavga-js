/**
 * @jest-environment jsdom
 */
/**
 * todo: hasar alınca ses çıksın vıcık vıcık
 */
class Tuval {
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
            sonundaSonSahneyiTut = false,
            isim,
            kacSahnedeResimDegisir = 10,
            yonuSagdir,
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
            kontroller,
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
        this.kontroller = kontroller;

        this.isim = isim;
        this.canCubuguID = canCubuguID;
        this.canCubuguIsimID = canCubuguIsimID;
        this.sagaBakiyor = sagaBakiyor;
        this.taklaAtiyor = false;
        this.taklayiSagaAtiyor = false;
        this.sonHasarAlinanYonSagdir = false;
        this.hitKutusuOludur = false;

        document.getElementById(this.canCubuguIsimID).innerText = this.isim;

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
        this.kanAkiyor = false;

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
                    savaskar.can = Math.max(0, savaskar.can - this.saldiriHasari);
                    savaskar.kanAkiyor = true;
                    savaskar.sonHasarAlinanYonSagdir = this.hitKutusu.merkezKordinat().x > savaskar.hitKutusu.x;
                    savaskar.canCubuguGuncelle();
                    console.log(savaskar.isim, savaskar.can);
                }
            })
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
        let yonluSpriteler = this.sagaBakiyor ? this.spriteler.sag : this.spriteler.sol;

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
             * sprite animasyonu bitimi burasıdır. mesela zıplarken peşisıra gelecek animasyon vs. burada seçilir.
             */
            if (this.sprite && this.sprite.birKereTamAnimasyonOldu && this.sonluEylemler.includes(this.sprite.isim)) {
                if (this.sprite.isim == 'taklaAt') {
                    this.hitKutusu.carpisabilir = true;
                    this.taklaAtiyor = false;
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
            if (this.kontroller.saldiri && !this.saldirildi) {
                this.saldir();
            }
            this.saldirildi = Boolean(this.kontroller.saldiri);
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

function main() {

    const tuval = new Tuval(document.querySelector('canvas'), 800, 600, 480);

    setInterval(() => {
        tuval.setZamanKutucugu();
    }, 1000)
    const arkaplan = new Sprite(tuval, {
        pozisyon: {
            x: 0,
            y: 0,
        },
        resimKaynagi: './sprites/NightForest/Image without mist.png',
        skala: 1.67,
    });
    const oyuncuKontroller = {
        solKosu: false,
        sagKosu: false,
        sonKosulanYonSagdir: false,
        saldiri: false,
        taklaAt: false,
        zipla: false,
    };
    const spriteler = {
        sol: {
            rolanti: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Idle.png',
                resimSayisi: 10,
                pozisyonOffset: { x: -130, y: -115 },
                skala: 1,
                isim: 'rolanti',
                yonuSagdir: false,
            }),
            kosu: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Run.png',
                resimSayisi: 10,
                pozisyonOffset: { x: -140, y: -115 },
                skala: 1,
                isim: 'kosu',
                yonuSagdir: false,
            }),
            donme: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_TurnAround.png',
                resimSayisi: 3,
                pozisyonOffset: { x: -140, y: -115 },
                skala: 1,
                isim: 'donme',
                yonuSagdir: false,
            }),
            taklaAt: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Roll.png',
                resimSayisi: 12,
                pozisyonOffset: { x: -130, y: -115 },
                skala: 1,

                isim: 'taklaAt',
                yonuSagdir: false,
            }),
            zipla: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Jump.png',
                resimSayisi: 3,
                pozisyonOffset: { x: -130, y: -115 },
                skala: 1,
                isim: 'zipla',
                yonuSagdir: false,
            }),

            dusus: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Fall.png',
                resimSayisi: 3,
                pozisyonOffset: { x: -130, y: -115 },
                skala: 1,
                isim: 'dusus',
                yonuSagdir: false,
            }),
            saldiri1: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_AttackNoMovement.png',
                resimSayisi: 4,
                pozisyonOffset: { x: -130, y: -115 },
                skala: 1,
                isim: 'saldiri1',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: false,
            }),
            saldiri2: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Attack2NoMovement.png',
                resimSayisi: 6,
                pozisyonOffset: { x: -130, y: -115 },
                skala: 1,
                isim: 'saldiri2',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: false,
            }),
            oldu: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Death.png',
                resimSayisi: 10,
                pozisyonOffset: { x: -130, y: -115 }, // pozisyonOffset: { x: -45, y: -165 },
                skala: 1,
                isim: 'oldu',
                yonuSagdir: false,
                sonsuzAnimasyon: false,
                sonundaSonSahneyiTut: true,
            }),

        },
        sag: {
            rolanti: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Idle.png',
                resimSayisi: 10,
                pozisyonOffset: { x: -122, y: -115 },
                skala: 1,
                isim: 'rolanti',
                yonuSagdir: true,
            }),
            kosu: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Run.png',
                resimSayisi: 10,
                pozisyonOffset: { x: -126, y: -115 },
                skala: 1,
                isim: 'kosu',
                yonuSagdir: true,
            }),
            donme: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_TurnAround.png',
                resimSayisi: 3,
                pozisyonOffset: { x: -126, y: -115 },
                skala: 1,
                isim: 'donme',
                yonuSagdir: true,
            }),
            taklaAt: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Roll.png',
                resimSayisi: 12,
                pozisyonOffset: { x: -122, y: -115 },
                skala: 1,

                isim: 'taklaAt',
                yonuSagdir: true,
            }),
            zipla: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Jump.png',
                resimSayisi: 3,
                pozisyonOffset: { x: -122, y: -115 },
                skala: 1,
                isim: 'zipla',
                yonuSagdir: true,
            }),
            dusus: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Fall.png',
                resimSayisi: 3,
                pozisyonOffset: { x: -122, y: -115 },
                skala: 1,
                isim: 'dusus',
                yonuSagdir: true,
            }),
            saldiri1: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_AttackNoMovement.png',
                resimSayisi: 4,
                pozisyonOffset: { x: -122, y: -115 },
                skala: 1,
                isim: 'saldiri1',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: true,
            }),
            saldiri2: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Attack2NoMovement.png',
                resimSayisi: 6,
                pozisyonOffset: { x: -122, y: -115 },
                skala: 1,
                isim: 'saldiri2',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: true,
            }),
            oldu: new Sprite(tuval, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Death.png',
                resimSayisi: 10,
                pozisyonOffset: { x: -122, y: -115 },  // pozisyonOffset: { x: -45, y: -165 },
                skala: 1,
                isim: 'oldu',
                yonuSagdir: true,
                sonsuzAnimasyon: false,
                sonundaSonSahneyiTut: true,
            }),
        },
    };
    const oyuncu = new Savasci(tuval, {
        renk: 'rgba(255,0,0,0.5)',
        pozisyon: { x: 150, y: tuval.canvas.height - 111 },
        sagaBakiyor: true,
        kontroller: oyuncuKontroller,

        genislik: 50,
        yukseklik: 100,
        isim: 'lutfullah',
        canCubuguID: 'ic-can-cubugu-1',
        canCubuguIsimID: 'can-cubugu-isim-1',
        spriteler,
    });
    const oyuncu2Kontroller = {
        solKosu: false,
        sagKosu: false,
        sonKosulanYonSagdir: false,
        saldiri: false,
        taklaAt: false,
        zipla: false,
    };
    const oyuncu2 = new Savasci(tuval, {
        renk: 'rgba(255,0,0,0.5)',
        pozisyon: { x: 600, y: 0 },
        sagaBakiyor: false,
        kontroller: oyuncu2Kontroller,
        genislik: 50,
        yukseklik: 100,
        isim: 'o',
        canCubuguID: 'ic-can-cubugu-2',
        canCubuguIsimID: 'can-cubugu-isim-2',
        spriteler,
    });

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                oyuncuKontroller.solKosu = true;
                oyuncuKontroller.sonKosulanYonSagdir = false;
                break;
            case 'ArrowRight':
                oyuncuKontroller.sagKosu = true;
                oyuncuKontroller.sonKosulanYonSagdir = true;
                break;
            case 'ArrowUp':
                oyuncuKontroller.zipla = true;
                break;
            case 'ArrowDown':
                oyuncuKontroller.saldiri = true;
                break;
            case 'ö':
            case 'Ö':
                oyuncuKontroller.taklaAt = true;
                break;
            case 'w':
            case 'W':
                oyuncu2Kontroller.zipla = true;
                break;
            case 'a':
            case 'A':
                oyuncu2Kontroller.solKosu = true;
                oyuncu2Kontroller.sonKosulanYonSagdir = false;
                break;
            case 's':
            case 'S':
                break;
            case 'd':
            case 'D':
                oyuncu2Kontroller.sagKosu = true;
                oyuncu2Kontroller.sonKosulanYonSagdir = true;
                break;
            case 'Shift':
                oyuncu2Kontroller.taklaAt = true;
                break;
            case ' ':
                oyuncu2Kontroller.saldiri = true;
                break;
        }
    });
    window.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                oyuncuKontroller.solKosu = false;
                oyuncuKontroller.sonKosulanYonSagdir = true;
                break;
            case 'ArrowRight':
                oyuncuKontroller.sagKosu = false;
                oyuncuKontroller.sonKosulanYonSagdir = false;
                break;
            case 'ArrowUp':
                oyuncuKontroller.zipla = false;
                break;
            case 'ArrowDown':
                oyuncuKontroller.saldiri = false;
                break;
            case 'ö':
            case 'Ö':
                oyuncuKontroller.taklaAt = false;
                break;
            case 'w':
            case 'W':
                oyuncu2Kontroller.zipla = false;
                break;
            case 'a':
            case 'A':
                oyuncu2Kontroller.solKosu = false;
                oyuncu2Kontroller.sonKosulanYonSagdir = true;
                break;
            case 's':
            case 'S':
                break;
            case 'd':
            case 'D':
                oyuncu2Kontroller.sagKosu = false;
                oyuncu2Kontroller.sonKosulanYonSagdir = false;
                break;
            case 'Shift':
                oyuncu2Kontroller.taklaAt = false;
                break;
            case ' ':
                oyuncu2Kontroller.saldiri = false;
                break;
        }
    });
    window.addEventListener('mousedown', () => {
        oyuncu2Kontroller.saldiri = true;
    })
    window.addEventListener('mouseup', () => {
        oyuncu2Kontroller.saldiri = false;
    })
    window.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    })

    // https://stackoverflow.com/questions/4787431/check-fps-in-js
    // The higher this value, the less the fps will reflect temporary variations
    // A value of 1 will only keep the last value
    // 16.7ms yani 60 fps'den baslatiyoruz hesaplamaya.

    const filterStrength = 5;
    let frameTime = 16.7, lastLoop = performance.now(), thisLoop;

    function canlandir() {
        window.requestAnimationFrame(canlandir);
        tuval.fps = 1000 / frameTime;
        tuval.temizle();
        arkaplan.guncelle();
        oyuncu.guncelle();
        oyuncu2.guncelle();
        SavasciCarpisma.engelle();

        let thisFrameTime = (thisLoop = performance.now()) - lastLoop;
        frameTime += (thisFrameTime - frameTime) / filterStrength;
        lastLoop = thisLoop;

    }

    let fpsOut = document.getElementById('fps');
    setInterval(function () {
        fpsOut.innerHTML = (1000 / frameTime).toFixed(1) + " fps";
    }, 1000);

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

