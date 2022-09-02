import {YayinciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciKontrolYoneticisi";
import {SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";
import {Socket} from "socket.io-client";

type SavasciKontrolTuslari = {
    [Property in keyof SavasciKontrolleri]: string | string[];
};
export class KlavyeKontrolYoneticisi extends YayinciKontrolYoneticisi {
    private wasdTuslari: SavasciKontrolTuslari = {
        saldiri: ' ',
        sagKosu: ["d", "D"],
        solKosu: ['a', 'A'],
        sonKosulanYonSagdir: ['d', 'D', 'a!', 'A!'],
        taklaAt: "Shift",
        zipla: ["w", "W"],
    };
    private okTuslari: SavasciKontrolTuslari = {
        saldiri: 'ArrowDown',
        sagKosu: "ArrowRight",
        solKosu: "ArrowLeft",
        sonKosulanYonSagdir: ["ArrowRight", 'ArrowLeft!'],
        taklaAt: ".",
        zipla: "ArrowUp",
    };
    private secilenTuslar: SavasciKontrolTuslari;
    private secilenTuslarTersi: { [index: string]: Array<keyof SavasciKontrolleri> } = {};
    private fareDeKullan: boolean;
    private fareElementi: HTMLElement | null;
    private keydownHalledici: any = null;
    private keyupHalledici: any = null;
    private mousedownHalledici: any = null;
    private contextMenuPreventer: any = null;

    constructor(galeAlinacakIsim: string, socket: Socket, wasdMi: boolean, fareDeKullan = false, fareElementi: HTMLElement | null = null) {
        super(galeAlinacakIsim, socket);
        this.fareDeKullan = fareDeKullan;
        this.fareElementi = fareElementi;
        if (wasdMi) {
            this.secilenTuslar = this.wasdTuslari;
        } else {
            this.secilenTuslar = this.okTuslari;
        }
        for (const kontrol in this.secilenTuslar) {
            let tuslar = this.secilenTuslar[kontrol as keyof SavasciKontrolleri];
            if (typeof tuslar === 'string') {
                tuslar = [tuslar];
            }
            for (const tus of tuslar) {
                if (this.secilenTuslarTersi[tus]) {
                    this.secilenTuslarTersi[tus].push(kontrol as keyof SavasciKontrolleri);
                } else {
                    this.secilenTuslarTersi[tus] = [kontrol as keyof SavasciKontrolleri];
                }
            }
        }
    }

    yonetmeyeBasla(kontroller?: SavasciKontrolleri): void {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            if (kontroller) {
                this.kontroller = kontroller;
            }
            // böyle yapmanın sebebi hem thisi addeventlistenerde görmek hem de removeeventlistener yapabilmektir.
            this.keydownHalledici = (event: KeyboardEvent) => {
                if (this.kontroller && !event.repeat) {
                    const baziKontroller: Partial<SavasciKontrolleri> = {};
                    if (event.key in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key].forEach(kontrol => {
                            baziKontroller[kontrol] = true;
                        });
                    }
                    if (event.key + '!' in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key + '!'].forEach(kontrol => {
                            baziKontroller[kontrol] = false;
                        });
                    }
                    this.kontrolGuncelle(baziKontroller);

                }
            }

            this.keyupHalledici = (event: KeyboardEvent) => {
                if (this.kontroller && !event.repeat) {
                    const baziKontroller: Partial<SavasciKontrolleri> = {};
                    if (event.key in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key].forEach(kontrol => {
                            baziKontroller[kontrol] = false;
                        });
                    }
                    if (event.key + '!' in this.secilenTuslarTersi) {
                        this.secilenTuslarTersi[event.key + '!'].forEach(kontrol => {
                            baziKontroller[kontrol] = true;
                        });
                    }
                    this.kontrolGuncelle(baziKontroller);

                }
            }

            this.mousedownHalledici = () => {
                const baziKontroller: Partial<SavasciKontrolleri> = {};
                baziKontroller.saldiri = true;
                this.kontrolGuncelle(baziKontroller);
            }

            this.contextMenuPreventer = (event: MouseEvent) => {
                event.preventDefault();
            }


            window.addEventListener('keydown', this.keydownHalledici);
            window.addEventListener('keyup', this.keyupHalledici);
            if (this.fareDeKullan && this.fareElementi) {
                this.fareElementi.addEventListener('mousedown', this.mousedownHalledici);
                this.fareElementi.addEventListener('contextmenu', this.contextMenuPreventer);
            }
        }


    }

    yonetmeyiBirak(): void {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
            window.removeEventListener('keydown', this.keydownHalledici);
            window.removeEventListener('keyup', this.keyupHalledici);
            if (this.fareDeKullan && this.fareElementi) {
                this.fareElementi.removeEventListener('mousedown', this.mousedownHalledici);
                this.fareElementi.removeEventListener('contextmenu', this.contextMenuPreventer);
            }
        }

    }


}
