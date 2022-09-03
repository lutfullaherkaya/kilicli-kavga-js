import {Tuval} from "@/js/kilicli-kavga/tuval";
import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";

export class Dikdortgen {
    private tuval: Tuval;
    /**
     * Position is pass by reference and can be changed by the caller thus it must not be reassigned.
     */
    public readonly pos: TwoDVector;
    public w: number;
    public h: number;
    private renk: string;
    public carpisabilir: boolean;

    constructor(tuval: Tuval, position: TwoDVector, genislik: number, yukseklik: number, renk = 'rgba(255, 255, 255, 0.5)', carpisabilir = true) {
        this.tuval = tuval;
        this.pos = position;
        this.w = genislik;
        this.h = yukseklik;
        this.renk = renk;
        this.carpisabilir = carpisabilir;
    }

    ciz() {
        this.tuval.context!.fillStyle = this.renk;
        this.tuval.context!.fillRect(this.pos.x, this.pos.y, this.w, this.h);
    }

    yerdedir(): boolean {
        return this.pos.y + this.h >= this.tuval.yerKordinati;
    }

    ayagininAlti() {
        return this.tuval.yerKordinati - this.h;
    }

    static carpisir(dikdortgen1: Dikdortgen, dikdortgen2: Dikdortgen) {
        return dikdortgen1.carpisabilir && dikdortgen2.carpisabilir &&
            !dikdortgen1.solundadir(dikdortgen2) &&
            !dikdortgen1.sagindadir(dikdortgen2) &&
            !dikdortgen1.yukarisindadir(dikdortgen2) &&
            !dikdortgen1.asagisindadir(dikdortgen2);
    }

    solundadir(dikdortgen: Dikdortgen): boolean {
        return this.pos.x + this.w <= dikdortgen.pos.x;
    }

    sagindadir(dikdortgen: Dikdortgen): boolean {
        return this.pos.x >= dikdortgen.pos.x + dikdortgen.w;
    }

    yukarisindadir(dikdortgen: Dikdortgen): boolean {
        return this.pos.y + this.h <= dikdortgen.pos.y;
    }

    asagisindadir(dikdortgen: Dikdortgen): boolean {
        return this.pos.y >= dikdortgen.pos.y + dikdortgen.h;
    }

    merkezKordinat(): TwoDVector {
        return new TwoDVector(
            this.pos.x + this.w / 2,
            this.pos.y + this.h / 2
        )
    }



}
