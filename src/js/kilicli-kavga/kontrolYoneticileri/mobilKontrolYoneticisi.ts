import {YayinciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciKontrolYoneticisi";
import {Socket} from "socket.io-client";

/**
 * mobil arayüzden gelen kontrollerle çalışır.
 */
export class MobilKontrolYoneticisi extends YayinciKontrolYoneticisi {
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
