import {Tuval} from "@/js/kilicli-kavga/tuval";
import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";

export class Dikdortgen {
    private tuval: Tuval;
    /**
     * Position is pass by reference and can be changed by the caller thus it must not be reassigned.
     */
    public position: TwoDVector;
    public genislik: number;
    public yukseklik: number;
    private renk: string;
    public carpisabilir: boolean;

    constructor(tuval: Tuval, position: TwoDVector, genislik: number, yukseklik: number, renk = 'rgba(255, 255, 255, 0.5)', carpisabilir = true) {
        this.tuval = tuval;
        this.position = position;
        this.genislik = genislik;
        this.yukseklik = yukseklik;
        this.renk = renk;
        this.carpisabilir = carpisabilir;
    }

    ciz() {
        this.tuval.context!.fillStyle = this.renk;
        this.tuval.context!.fillRect(this.position.x, this.position.y, this.genislik, this.yukseklik);
    }

    yerdedir(): boolean {
        return this.position.y + this.yukseklik >= this.tuval.yerKordinati;
    }

    ayagininAlti() {
        return this.tuval.yerKordinati - this.yukseklik;
    }

    static carpisir(dikdortgen1: Dikdortgen, dikdortgen2: Dikdortgen) {
        return dikdortgen1.carpisabilir && dikdortgen2.carpisabilir &&
            !dikdortgen1.solundadir(dikdortgen2) &&
            !dikdortgen1.sagindadir(dikdortgen2) &&
            !dikdortgen1.yukarisindadir(dikdortgen2) &&
            !dikdortgen1.asagisindadir(dikdortgen2);
    }

    solundadir(dikdortgen: Dikdortgen): boolean {
        return this.position.x + this.genislik <= dikdortgen.position.x;
    }

    sagindadir(dikdortgen: Dikdortgen): boolean {
        return this.position.x >= dikdortgen.position.x + dikdortgen.genislik;
    }

    yukarisindadir(dikdortgen: Dikdortgen): boolean {
        return this.position.y + this.yukseklik <= dikdortgen.position.y;
    }

    asagisindadir(dikdortgen: Dikdortgen): boolean {
        return this.position.y >= dikdortgen.position.y + dikdortgen.yukseklik;
    }

    merkezKordinat(): TwoDVector {
        return new TwoDVector(
            this.position.x + this.genislik / 2,
            this.position.y + this.yukseklik / 2
        )
    }



}
