import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Boyut, Kordinat} from "@/js/kilicli-kavga/interfaces";

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
