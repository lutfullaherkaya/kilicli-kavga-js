export interface Kordinat {
    x: number;
    y: number;
}

export interface Boyut {
    x: number;
    y: number;
}

export interface SavasciKontrolleri {
    saldiri: boolean;
    taklaAt: boolean;
    solKosu: boolean;
    sonKosulanYonSagdir: boolean;
    sagKosu: boolean;
    zipla: boolean
}

/**
 * todo: hasar alınca ses çıksın vıcık vıcık
 */
export class Tuval {
    canvas: HTMLCanvasElement;
    yerKordinati: number;
    readonly context: CanvasRenderingContext2D | null;
    private zaman: number;
    fps: number;

    constructor(canvas: HTMLCanvasElement, genislik: number, yukseklik: number, yerKordianti: number) {
        this.canvas = canvas;
        this.canvas.width = genislik;
        this.canvas.height = yukseklik;
        this.yerKordinati = yerKordianti;
        this.context = this.canvas.getContext('2d');
        this.context!.imageSmoothingEnabled = false;
        this.zaman = 90;
        this.temizle();
        this.fps = 60; // bu değer sürekli güncellenecek

    }

    temizle() {
        this.context!.fillStyle = '#0b2e2f';
        this.context!.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setZamanKutucugu() {
        document.getElementById('zaman')!.innerText = String(this.zaman--);

    }

    /**
     *  Benim ekranım 144hz olduğu için 144hz'ye göre hesaplıyorum. Mesela 60 fps'de iki kat hızlı olması gerek bundan
     *  dolayı animasyonların.
     */
    gercekHiz(hiz: number) {
        return hiz * 144 / this.fps;
    }

    gercekSahneSayisi(sahneSayisi: number) {
        return Math.max(1, Math.round(sahneSayisi * this.fps / 144));
    }
}

export class Dikdortgen {
    private tuval: Tuval;
    x: number;
    y: number;
    genislik: number;
    yukseklik: number;
    private renk: string;
    carpisabilir: boolean;

    constructor(tuval: Tuval, x: number, y: number, genislik: number, yukseklik: number, renk: string, carpisabilir = true) {
        this.tuval = tuval;
        this.x = x;
        this.y = y;
        this.genislik = genislik;
        this.yukseklik = yukseklik;
        this.renk = renk;
        this.carpisabilir = carpisabilir;
    }

    ciz() {
        this.tuval.context!.fillStyle = this.renk;
        this.tuval.context!.fillRect(this.x, this.y, this.genislik, this.yukseklik);
    }

    yerdedir(): boolean {
        return this.y + this.yukseklik >= this.tuval.yerKordinati;
    }

    static carpisir(dikdortgen1: Dikdortgen, dikdortgen2: Dikdortgen) {
        return dikdortgen1.carpisabilir && dikdortgen2.carpisabilir &&
            !dikdortgen1.solundadir(dikdortgen2) &&
            !dikdortgen1.sagindadir(dikdortgen2) &&
            !dikdortgen1.yukarisindadir(dikdortgen2) &&
            !dikdortgen1.asagisindadir(dikdortgen2);
    }

    solundadir(dikdortgen: Dikdortgen): boolean {
        return this.x + this.genislik <= dikdortgen.x;
    }

    sagindadir(dikdortgen: Dikdortgen): boolean {
        return this.x >= dikdortgen.x + dikdortgen.genislik;
    }

    yukarisindadir(dikdortgen: Dikdortgen): boolean {
        return this.y + this.yukseklik <= dikdortgen.y;
    }

    asagisindadir(dikdortgen: Dikdortgen): boolean {
        return this.y >= dikdortgen.y + dikdortgen.yukseklik;
    }

    merkezKordinat(): Kordinat {
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
export class Sprite {
    private tuval: Tuval;
    pozisyon: Kordinat;
    private pozisyonOffset: Boyut;
    private resimSayisi: number;
    private sonsuzAnimasyon: boolean;
    public isim: string;
    private suankiResim: number;
    private skala: number;
    private resim: HTMLImageElement;
    yonuSagdir: boolean;
    private sonundaSonSahneyiTut: boolean;
    private kacSahnedeResimDegisir: number;
    private suankiSahne: number;
    private gercekKacSahnedeResimDegistir: number;
    birKereTamAnimasyonOldu: boolean;

    constructor(
        tuval: Tuval, {
            pozisyon = {x: 0, y: 0},
            pozisyonOffset = {x: 0, y: 0},
            resimKaynagi = '',
            skala = 1,
            resimSayisi = 1,
            sonsuzAnimasyon = true,
            sonundaSonSahneyiTut = false,
            isim = 'sprite',
            kacSahnedeResimDegisir = 10,
            yonuSagdir = false,
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
        this.tuval.context!.drawImage(
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
    static carpismayacakKadarOtele(savasci1: Savasci, savasci2: Savasci) {
        if (Dikdortgen.carpisir(savasci1.hitKutusu, savasci2.hitKutusu)) {
            if (Math.abs(savasci1.hitKutusu.merkezKordinat().y - savasci2.hitKutusu.merkezKordinat().y) <
                Math.abs(savasci1.hitKutusu.merkezKordinat().x - savasci2.hitKutusu.merkezKordinat().x)) {
                SavasciCarpisma.yataydaKenarinaOtele(savasci1, savasci2);
                savasci1.ivme.x = 0;
                savasci1.hiz.x = 0;
            } else {
                SavasciCarpisma.duseydeKenarinaOtele(savasci1, savasci2);
                savasci1.hiz.y = 0;
                savasci1.ivme.y = 0;
            }
        }
    }

    static duseydeKenarinaOtele(savasci1: Savasci, savasci2: Savasci) {
        if (savasci1.hitKutusu.merkezKordinat().y < savasci2.hitKutusu.merkezKordinat().y) { // yukarisinda olacak
            savasci1.hitKutusu.y = savasci2.hitKutusu.y - savasci1.hitKutusu.yukseklik;
        } else if (savasci1.hitKutusu.merkezKordinat().y >= savasci2.hitKutusu.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savasci2.hitKutusu.y + savasci2.hitKutusu.yukseklik;
            if (yeniYPozisyonu < savasci1.tuval.yerKordinati - savasci1.hitKutusu.yukseklik) {
                savasci1.hitKutusu.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    static yataydaKenarinaOtele(savasci1: Savasci, savasci2: Savasci) {
        if (savasci1.hitKutusu.merkezKordinat().x < savasci2.hitKutusu.merkezKordinat().x) { // solunda olacak
            savasci1.hitKutusu.x = savasci2.hitKutusu.x - savasci1.hitKutusu.genislik;
        } else if (savasci1.hitKutusu.merkezKordinat().x > savasci2.hitKutusu.merkezKordinat().x) { // saginda olacak
            savasci1.hitKutusu.x = savasci2.hitKutusu.x + savasci2.hitKutusu.genislik;
        }
    }
}

export class Savasci {
    static lar: Savasci[] = [];
    tuval: Tuval;
    hitKutusu: Dikdortgen;
    hiz: { x: number; y: number };
    ivme: { x: number; y: number };
    private yurumeIvmesi: { x: number; y: number };
    private kontroller: SavasciKontrolleri;
    private isim: string;
    private canCubuguID: string;
    private canCubuguIsimID: string;
    private sagaBakiyor: boolean;
    private taklaAtiyor: boolean;
    private taklayiSagaAtiyor: boolean;
    private sonHasarAlinanYonSagdir: boolean;
    private hitKutusuOludur: boolean;
    private yercekimiIvmesi: number;
    private ziplamaHizi: number;
    private yurumeHizi: number;
    private can: number;
    private kosuyor: boolean;
    private silahKutusu: Dikdortgen;
    private saldiriHasari: number;
    private spriteler: any; // todo: bunu dynamic typeli yap
    private sprite: Sprite;
    private sonluEylemler: string[];
    private suanYapilanEylem: null | { spriteAdi: string };
    private kanSpritesi: Sprite;
    private kanAkiyor: boolean;
    private alternatifSaldiri: boolean;

    constructor(
        tuval: Tuval, {
            renk = '',
            pozisyon = {x: 0, y: 0} as Kordinat,
            sagaBakiyor = false,
            kontroller,
            genislik,
            yukseklik,
            isim,
            canCubuguID,
            canCubuguIsimID,
            spriteler,
        }: any) {
        this.tuval = tuval;
        this.hitKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, genislik, yukseklik, renk);
        this.hiz = {x: 0, y: 0};
        this.ivme = {x: 0, y: 0}; // yercekimi haric
        this.yurumeIvmesi = {x: 0, y: 0};
        this.kontroller = kontroller;

        this.isim = isim;
        this.canCubuguID = canCubuguID;
        this.canCubuguIsimID = canCubuguIsimID;
        this.sagaBakiyor = sagaBakiyor;
        this.taklaAtiyor = false;
        this.taklayiSagaAtiyor = false;
        this.sonHasarAlinanYonSagdir = false;
        this.hitKutusuOludur = false;

        document.getElementById(this.canCubuguIsimID)!.innerText = this.isim;
        this.yercekimiIvmesi = 0.098;

        this.ziplamaHizi = 6;
        this.yurumeHizi = 2;
        this.can = 100;

        this.kosuyor = false;
        this.silahKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, 193, 110, 'rgba(255,255,255,0.53)');
        this.saldiriHasari = 10;
        this.spriteler = spriteler;
        this.sprite = this.sagaBakiyor ? this.spriteler.sag.rolanti : this.spriteler.sol.rolanti;

        this.sonluEylemler = ['zipla', 'taklaAt', 'saldiri1', 'saldiri2'];
        this.suanYapilanEylem = null;

        this.kanSpritesi = new Sprite(this.tuval, {
            resimKaynagi: './sprites/Blood FX Lite/JASONTOMLEE_BLOOD_GUSH_3.png',
            pozisyon: {x: 32, y: tuval.canvas.height - 111},
            resimSayisi: 14,
            pozisyonOffset: {x: -30, y: -115},
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
        } else {
            this.silahKutusu.x += -this.silahKutusu.genislik + this.silahKutusu.genislik * 0.56;
        }
    }

    canCubuguGuncelle() {
        document.getElementById(this.canCubuguID)!.style.width = this.can + '%';
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
    mp3Cal(fileName: string) {
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
            } else {
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
            } else {
                this.hitKutusu.x -= this.tuval.gercekHiz(this.yurumeHizi);
            }
        } else {
            if (this.sagaBakiyor && this.kontroller.sagKosu) {
                this.hitKutusu.x += this.tuval.gercekHiz(this.yurumeHizi);
            } else if (!this.sagaBakiyor && this.kontroller.solKosu) {
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
                } else {
                    this.sprite = this.spriteler.sol.oldu;
                }
            }
        } else {
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

            } else { // pasif spriteler. eylem yapılınca bunlar gözükmez.
                if (!this.hitKutusu.yerdedir()) {
                    if (this.hiz.y <= 0) {
                        this.sprite = yonluSpriteler.zipla;
                    } else {
                        this.sprite = yonluSpriteler.dusus;

                    }
                } else {
                    if (this.sagaBakiyor && this.kontroller.sagKosu || !this.sagaBakiyor && this.kontroller.solKosu) {
                        if ((this.sprite.isim == 'kosu' && (this.sprite.yonuSagdir != this.sagaBakiyor)) ||
                            this.sprite.isim == 'donme') {
                            if (this.sprite.isim == 'donme' && this.sprite.birKereTamAnimasyonOldu) {
                                this.spriteler.sol.donme.animasyonBasaSar();
                                this.spriteler.sag.donme.animasyonBasaSar();
                                this.sprite = yonluSpriteler.kosu;
                            } else {
                                if (this.sagaBakiyor) {
                                    this.sprite = this.spriteler.sol.donme;
                                } else {
                                    this.sprite = this.spriteler.sag.donme;
                                }
                            }

                        } else {
                            this.sprite = yonluSpriteler.kosu;
                        }

                    } else {
                        this.sprite = yonluSpriteler.rolanti;
                    }
                }

            }
        }

        return this;
    }

    spritePozisyonAyarlaHitKutusunaGore(sprite: Sprite) {
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
            this.spriteler.sag.oldu.pozisyonOffset = {x: -47, y: -165 - this.hitKutusu.yukseklik};
        } else {
            this.hitKutusu.x += kisaKenar;
            this.spriteler.sol.oldu.pozisyonOffset = {x: -180, y: -165 - this.hitKutusu.yukseklik};
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






