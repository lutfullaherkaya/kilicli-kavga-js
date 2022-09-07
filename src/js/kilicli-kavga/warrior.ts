import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Dikdortgen} from "@/js/kilicli-kavga/utility/dikdortgen";
import {Sprite} from "@/js/kilicli-kavga/sprite";
import {SpriteWithSound} from "@/js/kilicli-kavga/spriteWithSound";
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
    zipla: boolean;
    atesAt: boolean;
}


export interface WarriorInformation {
    isim: string;
    kontroller?: Partial<WarriorControls>;
    position?: TwoDVector;
    can?: number;
}

export class Warrior extends Entity {
    private weaponBox: Dikdortgen;


    private readonly ziplamaHizi = 6;
    private readonly yurumeHizi = 2;

    public kontroller: WarriorControls;
    public posEdgeActivatedWarriorControls = {
        saldiri: true,
        taklaAt: true,
        zipla: true
    } as Partial<WarriorControls>;

    public isim: string;
    public nameHash: number;
    private sagaBakiyor: boolean;
    private taklaAtiyor = false;
    private taklayiSagaAtiyor = false;
    private sonHasarAlinanYonSagdir = false;
    private hitKutusuOludur = false;

    public can = 100;

    private saldiriHasari = 12.5;
    private spriteler: SpriteBilgileri;

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
        this.weaponBox = new Dikdortgen(this.tuval, new TwoDVector(this.pos.x, this.pos.y + 10), 155, 110, 'rgba(255,255,255,0.53)');
        this.spriteler = spriteler;
        this.sprite = this.sagaBakiyor ? this.spriteler.sag.rolanti : this.spriteler.sol.rolanti;

        this.kanSpritesi = new SpriteWithSound(this.tuval, {
            resimKaynagi: './sprites/Blood FX Lite/JASONTOMLEE_BLOOD_GUSH_3.png',
            pozisyon: this.hitbox.pos,
            resimSayisi: 14,
            pozisyonOffset: new TwoDVector(-30, -115),
            skala: 1.5,
            isim: 'kan',
            kacSahnedeResimDegisir: 2,
            sonsuzAnimasyon: false,
        });


        let nameHash = 0;
        for (let i = 0; i < this.isim.length; i++) {
            nameHash = this.isim.charCodeAt(i) + ((nameHash << 5) - nameHash);
        }
        this.nameHash = nameHash % 360;

        const kopyalanmisSpriteler = {
            sag: {},
            sol: {}
        } as SpriteBilgileri;

        for (const sprite of Object.values(this.spriteler.sag)) {
            kopyalanmisSpriteler.sag[sprite.isim] = Object.assign(Object.create(Object.getPrototypeOf(sprite)), sprite)
            // check if firefox android
            if (!(navigator.userAgent.indexOf('Android') > -1 && navigator.userAgent.indexOf('Firefox') > -1)) {
                kopyalanmisSpriteler.sag[sprite.isim].canvasFilter = `contrast(1.1) hue-rotate(${nameHash}deg) saturate(1.5)`;
            }


            kopyalanmisSpriteler.sag[sprite.isim].pozisyon = this.hitbox.pos;
        }
        for (const sprite of Object.values(this.spriteler.sol)) {
            kopyalanmisSpriteler.sol[sprite.isim] = Object.assign(Object.create(Object.getPrototypeOf(sprite)), sprite)
            if (!(navigator.userAgent.indexOf('Android') > -1 && navigator.userAgent.indexOf('Firefox') > -1)) {
                kopyalanmisSpriteler.sol[sprite.isim].canvasFilter = `contrast(1.1) hue-rotate(${nameHash}deg) saturate(1.5)`;
            }

            kopyalanmisSpriteler.sol[sprite.isim].pozisyon = this.hitbox.pos;
        }
        this.spriteler = kopyalanmisSpriteler;


    }


    getDifferenceBetweenDatesInSeconds(date1: Date, date2: Date): number {
        const difference = date2.getTime() - date1.getTime();
        return Math.floor(difference / 1000);
    }

    updateWeaponPos() {
        this.weaponBox.pos.set(this.hitbox.pos);
        this.weaponBox.pos.y -= this.weaponBox.h - this.hitbox.h;
        if (!this.sagaBakiyor) {
            this.weaponBox.pos.x -= this.weaponBox.w - this.hitbox.w;
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

    atesAt() {
        if (!this.suanYapilanEylem) {
            this.suanYapilanEylem = {
                spriteAdi: 'atesAt',
            };
            this.mp3Cal('sounds/rocket-launch');// todo: change id
            this.tuval.entities.push(new Entity(
                'fuze',
                this.tuval,
                new TwoDVector(this.hitbox.pos.x, this.hitbox.pos.y+35),
                new TwoDVector(0, 0),
                new TwoDVector(this.sagaBakiyor ? 0.2 : -0.2, 0),
                false,
                0,
                100,
                100,
                this.spriteler![this.sagaBakiyor ? 'sag' : 'sol'].roket));
            console.log(this.tuval);
        }
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
    mp3Cal(fileName
               :
               string
    ) {
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
                if (savaskar !== this && Dikdortgen.carpisir(this.weaponBox, savaskar.hitbox)) {
                    savaskar.can = Math.max(0, savaskar.can - this.saldiriHasari);
                    savaskar.kanAkiyor = true;
                    savaskar.sonHasarAlinanYonSagdir = this.hitbox.merkezKordinat().x > savaskar.hitbox.pos.x;
                    if (savaskar.can <= 0 && !savaskar.hitKutusuOludur) {
                        this.score.kill++;
                    }
                    this.mp3Cal('sounds/minecraft-death')
                }
            })
        }

    }


    munasipSpriteBul() {
        const yonluSpriteler = this.sagaBakiyor ? this.spriteler.sag : this.spriteler.sol;

        if (this.oludur()) {
            if (this.sprite!.isim != 'oldu') {
                if (this.sonHasarAlinanYonSagdir) {
                    return this.spriteler.sag.oldu;
                } else {
                    return this.spriteler.sol.oldu;
                }
            }
        } else {
            if (this.suanYapilanEylem) {
                if (this.sprite!.isim !== this.suanYapilanEylem.spriteAdi) {
                    return yonluSpriteler[this.suanYapilanEylem.spriteAdi];
                }

            } else { // pasif spriteler. eylem yapılınca bunlar gözükmez.
                if (!this.hitbox.yerdedir()) {
                    if (this.v.y <= 0) {
                        return yonluSpriteler.zipla;
                    } else {
                        return yonluSpriteler.dusus;

                    }
                } else {
                    if (this.sagaBakiyor && this.kontroller.sagKosu || !this.sagaBakiyor && this.kontroller.solKosu) {
                        if ((this.sprite!.isim == 'kosu' && (this.sprite!.yonuSagdir != this.sagaBakiyor)) ||
                            this.sprite!.isim == 'donme') {
                            if (this.sprite!.isim == 'donme' && this.sprite!.birKereTamAnimasyonOldu) {
                                this.spriteler.sol.donme.rewindToBeginning().pause();
                                this.spriteler.sag.donme.rewindToBeginning().pause();
                                return yonluSpriteler.kosu;
                            } else {
                                if (this.sagaBakiyor) {
                                    return this.spriteler.sol.donme;
                                } else {
                                    return this.spriteler.sag.donme;
                                }
                            }

                        } else {
                            return yonluSpriteler.kosu;
                        }

                    } else {
                        return yonluSpriteler.rolanti;
                    }
                }

            }
        }
        return this.sprite;
    }

    oluHitKutusuYap() {
        if (!this.hitKutusuOludur) {
            this.hitKutusuOludur = true;
            const uzunKenar = this.hitbox.h;
            const kisaKenar = this.hitbox.w;
            this.hitbox.w = uzunKenar;
            this.hitbox.h = kisaKenar / 2;
            this.hitbox.pos.y += uzunKenar - kisaKenar + kisaKenar / 2;
            if (this.sonHasarAlinanYonSagdir) {
                this.oluHitKutusuSagaBakar = false;
                this.hitbox.pos.x -= kisaKenar * 1.5;
                this.spriteler.sag.oldu.pozisyonOffset = new TwoDVector(-47, -165 - this.hitbox.h);
            } else {
                this.oluHitKutusuSagaBakar = true;
                this.hitbox.pos.x += kisaKenar;
                this.spriteler.sol.oldu.pozisyonOffset = new TwoDVector(-180, -165 - this.hitbox.h);
            }
        }
    }

    updatePositionFromServer(serverPosition
                                 :
                                 TwoDVector
    ) {
        this.pos.set(serverPosition);
        return this;
    }

    canliHitKutusuYap() {
        if (this.hitKutusuOludur) {
            this.hitKutusuOludur = false;
            const uzunKenar = Math.max(this.hitbox.h, this.hitbox.w);
            const kisaKenar = 2 * Math.min(this.hitbox.h, this.hitbox.w);
            this.hitbox.w = kisaKenar;
            this.hitbox.h = uzunKenar;
            this.hitbox.pos.y -= uzunKenar - kisaKenar + kisaKenar / 2;
            if (!this.oluHitKutusuSagaBakar) {
                this.hitbox.pos.x += kisaKenar * 1.5;
            } else {
                this.hitbox.pos.x -= kisaKenar;
            }
        }
    }


    beforeUpdate()
        :
        this {
        /*this.hitbox.ciz();
        this.weaponBox.ciz();*/

        if (this.kontroller.zipla) {
            this.zipla();
            this.kontroller.zipla = false;
        }

        if (!this.oludur()) {
            if (this.kontroller.saldiri) {
                this.saldir();
                this.kontroller.saldiri = false;
            }
            if (this.kontroller.taklaAt) {
                this.taklaAt();
                this.kontroller.taklaAt = false;
            }
            if (this.kontroller.atesAt) {
                this.atesAt();
                this.kontroller.atesAt = false;
            }

        }


        this.updateWeaponPos();

        if (this.sprite && this.sprite.birKereTamAnimasyonOldu && !this.sprite.imageLoops) {
            switch (this.sprite.isim) {
                case 'taklaAt':
                    this.hitbox.carpisabilir = true;
                    this.taklaAtiyor = false;
                    break;
            }

            this.suanYapilanEylem = null;
            this.sprite.birKereTamAnimasyonOldu = false;
        }

        const munasipSprite = this.munasipSpriteBul();
        if (munasipSprite && munasipSprite.isim != this.sprite!.isim) {
            this.sprite!.rewindToBeginning().pause();
        }
        this.sprite = munasipSprite;


        if (this.oludur() && this.sprite!.isim == 'oldu' && !this.hitKutusuOludur) {
            this.oluHitKutusuYap();
        }

        if (this.kanAkiyor) {
            this.kanSpritesi.start().update();

            if (this.kanSpritesi.birKereTamAnimasyonOldu) {
                this.kanAkiyor = false;
                this.kanSpritesi.rewindToBeginning().pause().pause();
            }
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

    beforeMove() {
        if (this.kontroller.sagKosu && this.kontroller.sonKosulanYonSagdir) {
            this.sagaBakiyor = true;
        }
        if (this.kontroller.solKosu && !this.kontroller.sonKosulanYonSagdir) {
            this.sagaBakiyor = false;
        }

        if (this.taklaAtiyor) {
            if (this.taklayiSagaAtiyor) {
                this.v.x = Math.round(this.yurumeHizi * 1.25);
            } else {
                this.v.x = Math.round(-this.yurumeHizi * 1.25);
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
        return this;
    }


}
