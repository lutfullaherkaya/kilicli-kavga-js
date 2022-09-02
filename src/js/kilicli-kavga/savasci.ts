import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Dikdortgen} from "@/js/kilicli-kavga/dikdortgen";
import {Kordinat, SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";
import {Sprite} from "@/js/kilicli-kavga/sprite";
import {KontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/kontrolYoneticisi";

interface Score {
    kill: number;
    death: number;
    assist: number;
}

export class Savasci {
    public static lar: Savasci[] = [];
    public tuval: Tuval;
    public hitKutusu: Dikdortgen;
    public hiz = {x: 0, y: 0};
    public ivme = {x: 0, y: 0};
    private yurumeIvmesi = {x: 0, y: 0};
    private kontroller: SavasciKontrolleri;
    isim: string;
    private sagaBakiyor: boolean;
    private taklaAtiyor = false;
    private taklayiSagaAtiyor = false;
    private sonHasarAlinanYonSagdir = false;
    private hitKutusuOludur = false;
    private yercekimiIvmesi = 0.098;
    private ziplamaHizi = 6;
    private yurumeHizi = 2;
    private can = 100;
    private silahKutusu: Dikdortgen;
    private saldiriHasari = 10;
    private spriteler: any; // todo: bunu dynamic typeli yap
    private sprite: Sprite;
    private sonluEylemler: string[];
    private suanYapilanEylem: null | { spriteAdi: string } = null;
    private kanSpritesi: Sprite;
    private kanAkiyor = false;
    private alternatifSaldiri = true;  // surekli true false olur saldırdıkça
    private kontrolYoneticisi: null | KontrolYoneticisi;
    public isimGoster = true;
    public kalpGoster = true;
    public doluKalpResmi: HTMLImageElement;
    public bosKalpResmi: HTMLImageElement;
    public kalpGenisligi: number;
    public kalpYuksekligi: number;
    public kalpSayisi = 4;
    public respawnTimeSeconds = 7;
    public peopleDoRespawn = true;
    public respawnTimeLeft = this.respawnTimeSeconds;
    public dateOfDeath: Date | null = null;
    public score = {kill: 0, death: 0, assist: 0} as Score;
    public showScore = true;


    constructor(
        tuval: Tuval, {
            renk = '',
            pozisyon = {x: 0, y: 0} as Kordinat,
            sagaBakiyor = false,
            kontroller = {
                saldiri: false,
                taklaAt: false,
                solKosu: false,
                sonKosulanYonSagdir: false,
                sagKosu: false,
                zipla: false
            } as SavasciKontrolleri,
            kontrolYoneticisi = null as null | KontrolYoneticisi,
            genislik,
            yukseklik,
            isim,
            spriteler,
        }: any) {
        this.tuval = tuval;
        this.hitKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, genislik, yukseklik, renk);

        this.kontroller = kontroller;
        this.kontrolYoneticisi = kontrolYoneticisi;
        if (this.kontrolYoneticisi) {
            this.kontrolYoneticisi.yonetmeyeBasla(this.kontroller);
        }
        this.isim = isim;
        this.sagaBakiyor = sagaBakiyor;
        this.silahKutusu = new Dikdortgen(this.tuval, pozisyon.x, pozisyon.y, 193, 110, 'rgba(255,255,255,0.53)');
        this.spriteler = spriteler;
        this.sprite = this.sagaBakiyor ? this.spriteler.sag.rolanti : this.spriteler.sol.rolanti;

        this.sonluEylemler = ['zipla', 'taklaAt', 'saldiri1', 'saldiri2'];
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

        this.doluKalpResmi = new Image();
        this.doluKalpResmi.src = './sprites/minecraft-kalp-dolu.png';
        this.bosKalpResmi = new Image();
        this.bosKalpResmi.src = './sprites/minecraft-kalp-bos.png';
        this.kalpGenisligi = this.hitKutusu.genislik / this.kalpSayisi;
        this.kalpYuksekligi = this.kalpGenisligi;

        Savasci.lar.push(this);
    }

    static savasciCikar(savasci: Savasci) {
        const savasciIndeksi = Savasci.lar.indexOf(savasci);
        if (savasciIndeksi !== -1) {
            savasci.kontrolYoneticisi?.yonetmeyiBirak();
            Savasci.lar.splice(savasciIndeksi, 1);
        }
    }

    getDifferenceBetweenDatesInSeconds(date1: Date, date2: Date): number {
        const difference = date2.getTime() - date1.getTime();
        return Math.floor(difference / 1000);
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
                    if (savaskar.can <= 0) {
                        this.score.kill++;
                    }
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

    canliHitKutusuYap() {
        const uzunKenar = Math.max(this.hitKutusu.yukseklik, this.hitKutusu.genislik);
        const kisaKenar = 2 * Math.min(this.hitKutusu.yukseklik, this.hitKutusu.genislik);
        this.hitKutusu.genislik = kisaKenar;
        this.hitKutusu.yukseklik = uzunKenar;
        this.hitKutusu.y = 0;
        this.hitKutusu.x = this.tuval.canvas.width / 2 - this.hitKutusu.genislik / 2;

        this.hitKutusuOludur = false;
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

        if (this.isimGoster) {
            this.tuval.context!.textAlign = 'center';
            this.tuval.context!.fillStyle = 'white';
            this.tuval.context!.imageSmoothingEnabled = true;
            this.tuval.context!.fillText(this.isim, this.hitKutusu.x + this.hitKutusu.genislik / 2, this.hitKutusu.y - 6, this.hitKutusu.genislik);
            this.tuval.context!.imageSmoothingEnabled = false;
        }
        if (this.kalpGoster) {
            const canGenisligi = this.hitKutusu.genislik / 5;
            for (let i = 0; i < this.kalpSayisi; ++i) {
                const kalpResmi = (i < this.can / (100 / this.kalpSayisi)) ? this.doluKalpResmi : this.bosKalpResmi;
                this.tuval.context!.drawImage(
                    kalpResmi,
                    (this.hitKutusu.genislik - this.kalpSayisi * this.kalpGenisligi) / 2 + (this.hitKutusu.x + this.kalpGenisligi * i),
                    this.hitKutusu.y - this.kalpYuksekligi - 19,
                    this.kalpGenisligi,
                    this.kalpYuksekligi
                )
            }
        }
        if (this.showScore) {
            this.tuval.context!.textAlign = 'center';
            this.tuval.context!.fillStyle = 'white';
            this.tuval.context!.imageSmoothingEnabled = true;
            this.tuval.context!.fillText(`L:${this.score.kill} Ö:${this.score.death}`, this.hitKutusu.x + this.hitKutusu.genislik / 2, this.hitKutusu.y - 36, this.hitKutusu.genislik);
            this.tuval.context!.imageSmoothingEnabled = false;
        }
        if (this.oludur()) {
            if (this.dateOfDeath == null) {
                this.dateOfDeath = new Date();
                this.score.death++;
            }
            this.respawnTimeLeft = this.respawnTimeSeconds - Math.floor(this.getDifferenceBetweenDatesInSeconds(this.dateOfDeath!, new Date()));
            if (this.respawnTimeLeft < 0) {
                this.respawnTimeLeft = this.respawnTimeSeconds;
                if (this.peopleDoRespawn) {
                    this.can = 100;
                    this.canliHitKutusuYap();
                }
                this.dateOfDeath = null;
            }
        }

        if (this.oludur() && this.peopleDoRespawn) {
            this.tuval.context!.textAlign = 'center';
            this.tuval.context!.fillStyle = 'white';
            this.tuval.context!.imageSmoothingEnabled = true;
            this.tuval.context!.fillText(String(this.respawnTimeLeft), this.hitKutusu.x + this.hitKutusu.genislik / 2, this.hitKutusu.y - 50, this.hitKutusu.genislik);
            this.tuval.context!.imageSmoothingEnabled = false;
        }

        return this;
    }

}
