import {Tuval} from "@/js/kilicli-kavga/tuval";
import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";

/**
 * Bu hocama teşekkürler grafik için
 * https://aamatniekss.itch.io/fantasy-knight-free-pixelart-animated-character
 *
 */
export class Sprite {
    private tuval: Tuval;
    pozisyon: TwoDVector;
    public pozisyonOffset: TwoDVector;
    private resimSayisi: number;
    imageLoops: boolean;
    public isim: string;
    private suankiResim: number;
    private skala: number;
    private resim: HTMLImageElement;
    public yonuSagdir: boolean;
    private sonundaSonSahneyiTut: boolean;
    private kacSahnedeResimDegisir: number;
    private suankiSahne: number;
    private gercekKacSahnedeResimDegistir: number;
    birKereTamAnimasyonOldu: boolean;
    public canvasFilter: string | null = null;
    isPlaying = false;

    constructor(
        tuval: Tuval, {
            pozisyon = new TwoDVector(0, 0),
            pozisyonOffset = new TwoDVector(0, 0),
            resimKaynagi = '',
            skala = 1,
            resimSayisi = 1,
            sonsuzAnimasyon: imageLoops = true,
            sonundaSonSahneyiTut = false,
            isim = 'sprite',
            kacSahnedeResimDegisir = 10,
            yonuSagdir = false,
            canvasFilter = null as null | string,
        }) {
        this.tuval = tuval;
        this.pozisyon = pozisyon;
        this.pozisyonOffset = pozisyonOffset;
        this.resimSayisi = resimSayisi;
        this.imageLoops = imageLoops;
        this.isim = isim;
        this.suankiResim = 0;
        this.skala = skala;
        this.resim = new Image();
        this.resim.src = resimKaynagi;
        this.resimSayisi = resimSayisi;
        this.yonuSagdir = yonuSagdir;
        this.sonundaSonSahneyiTut = sonundaSonSahneyiTut;
        this.canvasFilter = canvasFilter;

        this.kacSahnedeResimDegisir = kacSahnedeResimDegisir;
        if (this.isim == 'donme') {
            this.kacSahnedeResimDegisir = 20;
        }
        this.suankiSahne = 0;
        this.gercekKacSahnedeResimDegistir = this.tuval.gercekSahneSayisi(this.kacSahnedeResimDegisir);

        this.birKereTamAnimasyonOldu = false;

    }

    ciz(): this {
        if (this.canvasFilter) {
            this.tuval.context!.filter = this.canvasFilter;
        }

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

        if (this.canvasFilter) {
            this.tuval.context!.filter = 'none';
        }

        return this;
    }

    rewindToBeginning(): this {
        this.suankiResim = 0;
        this.suankiSahne = 0;
        this.birKereTamAnimasyonOldu = false;
        this.gercekKacSahnedeResimDegistir = this.tuval.gercekSahneSayisi(this.kacSahnedeResimDegisir);
        return this;
    }

    start(): this {
        if (!this.isPlaying) {
            this.isPlaying = true;
        }
        return this;
    }

    pause(): this {
        if (this.isPlaying) {
            this.isPlaying = false;
        }

        return this;
    }


    update(): this {
        if (this.isPlaying) {
            if (this.suankiResim === this.resimSayisi) {
                this.birKereTamAnimasyonOldu = true;
                if (!this.imageLoops && this.birKereTamAnimasyonOldu && this.sonundaSonSahneyiTut) {
                    this.suankiResim = this.resimSayisi - 1;
                }
            }
            if (this.imageLoops || !this.birKereTamAnimasyonOldu || this.sonundaSonSahneyiTut) {
                this.ciz();
            }
            if (this.suankiSahne === 0) {
                this.suankiResim++;
                this.gercekKacSahnedeResimDegistir = this.tuval.gercekSahneSayisi(this.kacSahnedeResimDegisir);
            }
            this.suankiSahne = (this.suankiSahne + 1) % this.gercekKacSahnedeResimDegistir;
        }
        return this;
    }

}

