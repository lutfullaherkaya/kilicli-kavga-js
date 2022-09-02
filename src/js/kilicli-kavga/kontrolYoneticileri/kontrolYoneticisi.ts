import {SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

export abstract class KontrolYoneticisi {
    protected kontroller: SavasciKontrolleri | null = null;
    protected yonetiliyor = false;
    public galeAlinacakIsim: string;

    protected constructor(galeAlinacakIsim: string) {
        this.galeAlinacakIsim = galeAlinacakIsim;
    }

    abstract yonetmeyeBasla(kontroller?: SavasciKontrolleri): void;

    kontrolGuncelle(baziKontroller: Partial<SavasciKontrolleri>): void {
        if (this.kontroller && this.yonetiliyor) {
            Object.assign(this.kontroller, baziKontroller);
        }
    }

    abstract yonetmeyiBirak(): void;
}
