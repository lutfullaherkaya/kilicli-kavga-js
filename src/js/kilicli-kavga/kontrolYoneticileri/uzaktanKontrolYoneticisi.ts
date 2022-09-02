import {SavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/savasciKontrolYoneticisi";
import {Socket} from "socket.io-client";
import {WarriorInformation, SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

export class UzaktanKontrolYoneticisi extends SavasciKontrolYoneticisi {
    private socket: Socket;
    private oyunBilgisiHalledici: any = null;

    constructor(socket: Socket) {
        super();
        this.socket = socket;
    }


    yonetirken(): void {
        this.oyunBilgisiHalledici = (warriorInformation: WarriorInformation) => {
            if (warriorInformation.isim === this.savasci!.isim) {
                if (warriorInformation.kontroller) {
                    this.kontrolGuncelle(warriorInformation.kontroller);
                }
                if (warriorInformation.position) {
                    this.savasci!.updatePositionFromServer(warriorInformation.position);
                }
            }
        }
        this.socket.on('oyun bilgisi', this.oyunBilgisiHalledici);
    }

    yonetmeyiBirakirken(): void {
        this.socket.off('oyun bilgisi', this.oyunBilgisiHalledici);
    }
}
