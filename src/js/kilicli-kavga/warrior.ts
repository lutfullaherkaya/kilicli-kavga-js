import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Dikdortgen} from "@/js/kilicli-kavga/utility/dikdortgen";
import {Sprite} from "@/js/kilicli-kavga/sprite";
import {SavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/savasciKontrolYoneticisi";
import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";
import {Entity} from "@/js/kilicli-kavga/entity";

export interface Score {
    kill: number;
    death: number;
    assist: number;
}

export interface SpriteBilgileri {
    sol: {
        [key: string]: Sprite;
    },
    sag: {
        [key: string]: Sprite;
    }
}

export interface WarriorControls {
    saldiri: boolean;
    taklaAt: boolean;
    solKosu: boolean;
    sonKosulanYonSagdir: boolean;
    sagKosu: boolean;
    zipla: boolean
}


export interface WarriorInformation {
    isim: string;
    kontroller?: Partial<WarriorControls>;
    position?: TwoDVector;
    can?: number;
}

export class Warrior extends Entity {
    private silahKutusu: Dikdortgen;


    private readonly ziplamaHizi = 6;
    private readonly yurumeHizi = 2;

    public kontroller: WarriorControls;
    public posEdgeActivatedWarriorControls = {
        saldiri: true,
        taklaAt: true,
        zipla: true
    } as Partial<WarriorControls>;

    public isim: string;
    private sagaBakiyor: boolean;
    private taklaAtiyor = false;
    private taklayiSagaAtiyor = false;
    private sonHasarAlinanYonSagdir = false;
    private hitKutusuOludur = false;

    public can = 100;

    private saldiriHasari = 10;
    private spriteler: SpriteBilgileri;

    private sonluEylemler: string[];
    private suanYapilanEylem: null | { spriteAdi: string } = null;
    private kanSpritesi: Sprite;
    private kanAkiyor = false;
    private alternatifSaldiri = true;  // surekli true false olur saldırdıkça
    public kontrolYoneticisi: null | SavasciKontrolYoneticisi;
    public respawnTimeSeconds = 4;
    public peopleDoRespawn = true;
    public respawnTimeLeft = this.respawnTimeSeconds;
    public dateOfDeath: Date | null = null;
    public score = {kill: 0, death: 0, assist: 0} as Score;
    public showScore = false;
    private oluHitKutusuSagaBakar = false;


    constructor(
        isim: string,
        tuval: Tuval,
        spriteler: SpriteBilgileri,
        position: TwoDVector = new TwoDVector(0, 0),
        velocity: TwoDVector = new TwoDVector(0, 0),
        acceleration: TwoDVector = new TwoDVector(0, 0),
        hasGravity = true,
        groundY = 100,
        width = 50,
        height = 100,
        sagaBakiyor = false,
        kontrolYoneticisi = null as null | SavasciKontrolYoneticisi,
        kontroller = {
            saldiri: false,
            taklaAt: false,
            solKosu: false,
            sonKosulanYonSagdir: false,
            sagKosu: false,
            zipla: false
        } as WarriorControls,
    ) {
        super(
            isim,
            tuval,
            position,
            velocity,
            acceleration,
            hasGravity,
            groundY,
            width,
            height,
        );
        this.kontroller = kontroller;
        this.kontrolYoneticisi = kontrolYoneticisi;
        if (this.kontrolYoneticisi) {
            this.kontrolYoneticisi.yonetmeyeBasla(this);
        }
        this.isim = isim;
        this.sagaBakiyor = sagaBakiyor;
        this.silahKutusu = new Dikdortgen(this.tuval, new TwoDVector(this.pos.x, this.pos.y), 193, 110, 'rgba(255,255,255,0.53)');
        this.spriteler = spriteler;
        this.sprite = this.sagaBakiyor ? this.spriteler.sag.rolanti : this.spriteler.sol.rolanti;

        this.sonluEylemler = ['zipla', 'taklaAt', 'saldiri1', 'saldiri2'];
        this.kanSpritesi = new Sprite(this.tuval, {
            resimKaynagi: './sprites/Blood FX Lite/JASONTOMLEE_BLOOD_GUSH_3.png',
            pozisyon: new TwoDVector(32, tuval.canvas.height - 111),
            resimSayisi: 14,
            pozisyonOffset: new TwoDVector(-30, -115),
            skala: 1.5,
            isim: 'kan',
            kacSahnedeResimDegisir: 2,
            sonsuzAnimasyon: false,
        });



    }


    getDifferenceBetweenDatesInSeconds(date1: Date, date2: Date): number {
        const difference = date2.getTime() - date1.getTime();
        return Math.floor(difference / 1000);
    }

    silahYeriniAyarla() {
        this.silahKutusu.position.x = this.hitbox.position.x;
        this.silahKutusu.position.y = this.hitbox.position.y - 10;

        if (this.sagaBakiyor) {
            this.silahKutusu.position.x += this.hitbox.genislik - this.silahKutusu.genislik * 0.44;
        } else {
            this.silahKutusu.position.x += -this.silahKutusu.genislik + this.silahKutusu.genislik * 0.56;
        }
    }

    oludur() {
        return this.can <= 0;
    }

    zipla() {
        if (this.hitbox.yerdedir()) {
            this.v.y -= this.ziplamaHizi;
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
            this.hitbox.carpisabilir = false;
        }
    }

    // play mp3 file
    mp3Cal(fileName: string) {
        const audio = new Audio(`/${fileName}.mp3`);
        audio.play();
    }


    saldir() {
        if (!this.suanYapilanEylem) {
            if (this.isim.toLowerCase() === 'ahmet') {
                this.mp3Cal('ahmet');
            }
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
            this.tuval.warriors.forEach((savaskar) => {
                if (savaskar !== this && Dikdortgen.carpisir(this.silahKutusu, savaskar.hitbox)) {
                    savaskar.can = Math.max(0, savaskar.can - this.saldiriHasari);
                    savaskar.kanAkiyor = true;
                    savaskar.sonHasarAlinanYonSagdir = this.hitbox.merkezKordinat().x > savaskar.hitbox.position.x;
                    if (savaskar.can <= 0 && !savaskar.hitKutusuOludur) {
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


        if (this.taklaAtiyor) {
            if (this.taklayiSagaAtiyor) {
                this.v.x = this.yurumeHizi;
            } else {
                this.v.x = -this.yurumeHizi;
            }
        } else {
            if (this.sagaBakiyor && this.kontroller.sagKosu) {
                this.v.x = this.yurumeHizi;
            } else if (!this.sagaBakiyor && this.kontroller.solKosu) {
                this.v.x = -this.yurumeHizi;
            } else {
                this.v.x = 0;
            }
        }
        this.move();

        return this;
    }

    munasipSpriteSec() {
        const yonluSpriteler = this.sagaBakiyor ? this.spriteler.sag : this.spriteler.sol;

        if (this.oludur()) {
            if (this.sprite!.isim != 'oldu') {
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
                        this.hitbox.carpisabilir = true;
                        this.taklaAtiyor = false;
                        this.kontroller.taklaAt = false;
                        break;
                }


                this.suanYapilanEylem = null;
                this.sprite.birKereTamAnimasyonOldu = false;
            }

            if (this.suanYapilanEylem) {
                if (this.sprite!.isim !== this.suanYapilanEylem.spriteAdi) {
                    this.sprite = yonluSpriteler[this.suanYapilanEylem.spriteAdi];
                    this.sprite.animasyonBasaSar();
                }

            } else { // pasif spriteler. eylem yapılınca bunlar gözükmez.
                if (!this.hitbox.yerdedir()) {
                    if (this.v.y <= 0) {
                        this.sprite = yonluSpriteler.zipla;
                    } else {
                        this.sprite = yonluSpriteler.dusus;

                    }
                } else {
                    this.kontroller.zipla = false;
                    if (this.sagaBakiyor && this.kontroller.sagKosu || !this.sagaBakiyor && this.kontroller.solKosu) {
                        if ((this.sprite!.isim == 'kosu' && (this.sprite!.yonuSagdir != this.sagaBakiyor)) ||
                            this.sprite!.isim == 'donme') {
                            if (this.sprite!.isim == 'donme' && this.sprite!.birKereTamAnimasyonOldu) {
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
        sprite.pozisyon.y = this.hitbox.position.y;
        sprite.pozisyon.x = this.hitbox.position.x;
        return this;
    }

    oluHitKutusuYap() {
        if (!this.hitKutusuOludur) {
            this.hitKutusuOludur = true;
            const uzunKenar = this.hitbox.yukseklik;
            const kisaKenar = this.hitbox.genislik;
            this.hitbox.genislik = uzunKenar;
            this.hitbox.yukseklik = kisaKenar / 2;
            this.hitbox.position.y += uzunKenar - kisaKenar + kisaKenar / 2;
            if (this.sonHasarAlinanYonSagdir) {
                console.log('sura')
                this.oluHitKutusuSagaBakar = false;
                this.hitbox.position.x -= kisaKenar * 1.5;
                this.spriteler.sag.oldu.pozisyonOffset = new TwoDVector(-47, -165 - this.hitbox.yukseklik);
            } else {
                console.log('bura')
                this.oluHitKutusuSagaBakar = true;
                this.hitbox.position.x += kisaKenar;
                this.spriteler.sol.oldu.pozisyonOffset = new TwoDVector(-180, -165 - this.hitbox.yukseklik);
            }
        }
    }

    canliHitKutusuYap() {
        if (this.hitKutusuOludur) {
            this.hitKutusuOludur = false;
            const uzunKenar = Math.max(this.hitbox.yukseklik, this.hitbox.genislik);
            const kisaKenar = 2 * Math.min(this.hitbox.yukseklik, this.hitbox.genislik);
            this.hitbox.genislik = kisaKenar;
            this.hitbox.yukseklik = uzunKenar;
            this.hitbox.position.y -= uzunKenar - kisaKenar + kisaKenar / 2;
            if (!this.oluHitKutusuSagaBakar) {
                this.hitbox.position.x += kisaKenar * 1.5;
            } else {
                this.hitbox.position.x -= kisaKenar;
            }
        }
    }

    updatePositionFromServer(serverPosition: TwoDVector) {
        this.pos.set(serverPosition);
        return this;
    }

    guncelle() {
        /*this.hitbox.ciz();
        this.silahKutusu.ciz();*/

        if (this.kontroller.zipla) {
            this.zipla();
        }

        if (!this.oludur()) {
            if (this.kontroller.saldiri) {
                this.saldir();
            }
            if (this.kontroller.taklaAt) {
                this.taklaAt();
            }
        }

        this.hareketEt();
        this.silahYeriniAyarla();

        this.munasipSpriteSec();
        this.spritePozisyonAyarlaHitKutusunaGore(this.sprite!);
        this.sprite!.guncelle();

        if (this.oludur() && this.sprite!.isim == 'oldu' && this.sprite!.birKereTamAnimasyonOldu && !this.hitKutusuOludur) {
            this.oluHitKutusuYap();
        }

        if (this.kanAkiyor) {
            this.spritePozisyonAyarlaHitKutusunaGore(this.kanSpritesi);
            this.kanSpritesi.guncelle();

            if (this.kanSpritesi.birKereTamAnimasyonOldu) {
                this.kanAkiyor = false;
                this.kanSpritesi.animasyonBasaSar();
            }
        }

        if (this.showScore) {
            this.tuval.context!.textAlign = 'center';
            this.tuval.context!.fillStyle = 'white';
            this.tuval.context!.imageSmoothingEnabled = true;
            this.tuval.context!.fillText(`L:${this.score.kill} Ö:${this.score.death}`, this.hitbox.position.x + this.hitbox.genislik / 2, this.hitbox.position.y - 36, this.hitbox.genislik);
            this.tuval.context!.imageSmoothingEnabled = false;
        }
        if (this.oludur()) {
            if (this.dateOfDeath == null) {
                this.dateOfDeath = new Date();
                this.score.death++;
                this.kontroller.sagKosu = false;
                this.kontroller.solKosu = false;


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
        } else { // biz öldü sandık ama aslında ölmemiş, sunucudan ölmemiş diye güncelleme gelmiş aslında.
            this.canliHitKutusuYap();
            this.dateOfDeath = null;
        }



        return this;
    }

}
