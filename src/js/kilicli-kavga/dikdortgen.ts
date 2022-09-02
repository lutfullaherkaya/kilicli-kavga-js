import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Kordinat} from "@/js/kilicli-kavga/interfaces";

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
