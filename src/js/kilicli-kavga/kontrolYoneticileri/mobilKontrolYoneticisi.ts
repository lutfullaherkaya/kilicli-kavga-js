import {YayinciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciKontrolYoneticisi";
import {Socket} from "socket.io-client";
import {SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

/**
 * mobil arayüzden gelen kontrollerle çalışır.
 */
export class MobilKontrolYoneticisi extends YayinciKontrolYoneticisi {
    constructor(galeAlinacakIsim: string, socket: Socket) {
        super(galeAlinacakIsim, socket);
    }

    yonetmeyeBasla(kontroller?: SavasciKontrolleri): void {
        if (!this.yonetiliyor) {
            this.yonetiliyor = true;
            if (kontroller) {
                this.kontroller = kontroller;
            }
        }
    }

    yonetmeyiBirak(): void {
        if (this.yonetiliyor) {
            this.yonetiliyor = false;
        }

    }

}
