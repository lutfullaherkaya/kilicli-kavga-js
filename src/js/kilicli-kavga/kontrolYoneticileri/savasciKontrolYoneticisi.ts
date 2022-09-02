import {Warrior, WarriorControls} from "@/js/kilicli-kavga/warrior";

export abstract class SavasciKontrolYoneticisi {
    protected yonetiliyor = false;
    public savasci: Warrior | null = null;

    yonetmeyeBasla(savasci: Warrior): void {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            this.savasci = savasci;
            this.yonetirken();
        }
    }

    abstract yonetirken() : void;

    kontrolGuncelle(baziKontroller: Partial<WarriorControls>): void {
        if (this.savasci && this.yonetiliyor && Object.keys(baziKontroller).length > 0) {
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
