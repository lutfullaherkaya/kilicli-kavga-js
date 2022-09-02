import {SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";
import {Savasci} from "@/js/kilicli-kavga/savasci";

export abstract class SavasciKontrolYoneticisi {
    protected yonetiliyor = false;
    public savasci: Savasci | null = null;

    yonetmeyeBasla(savasci: Savasci): void {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            this.savasci = savasci;
            this.yonetirken();
        }
    }

    abstract yonetirken() : void;

    kontrolGuncelle(baziKontroller: Partial<SavasciKontrolleri>): void {
        if (this.savasci && this.yonetiliyor) {
            Object.assign(this.savasci.kontroller, baziKontroller);
        }
    }

    yonetmeyiBirak(): void {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
            this.yonetmeyiBirakirken();
        }
    }

    abstract yonetmeyiBirakirken(): void;
}
