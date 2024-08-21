import {YayinciSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciSavasciKontrolYoneticisi";
import {Socket} from "socket.io-client";

/**
 * mobil arayüzden gelen kontrollerle çalışır.
 */
export class MobilSavasciKontrolYoneticisi extends YayinciSavasciKontrolYoneticisi {
    constructor(socket: Socket) {
        super(socket);
    }

    yonetirken(): void {
        // this class is controlled from outside with mobile interface.
    }

    yonetmeyiBirakirken(): void {
        // this class is controlled from outside with mobile interface.
    }

}
