import {KontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/kontrolYoneticisi";
import {Socket} from "socket.io-client";
import {OyunBilgisi, SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

export class UzaktanKontrolYoneticisi extends KontrolYoneticisi {
    private socket: Socket;
    private oyunBilgisiHalledici: any = null;

    constructor(socket: Socket, galeAlinacakIsim: string) {
        super(galeAlinacakIsim);
        this.socket = socket;
    }


    yonetmeyeBasla(kontroller?: SavasciKontrolleri): void {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            if (kontroller) {
                this.kontroller = kontroller;
            }

            this.oyunBilgisiHalledici = (oyunBilgisi: OyunBilgisi) => {
                if (oyunBilgisi.isim === this.galeAlinacakIsim) {
                    this.kontrolGuncelle(oyunBilgisi.kontroller);
                }
            }

            this.socket.on('oyun bilgisi', this.oyunBilgisiHalledici);
        }
    }

    yonetmeyiBirak(): void {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
            this.socket.off('oyun bilgisi', this.oyunBilgisiHalledici);
        }
    }
}
