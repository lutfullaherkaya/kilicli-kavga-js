import {SavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/savasciKontrolYoneticisi";
import {Socket} from "socket.io-client";
import {WarriorInformation, SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

export abstract class YayinciKontrolYoneticisi extends SavasciKontrolYoneticisi {
    private socket: Socket;

    protected constructor(socket: Socket) {
        super();
        this.socket = socket;
    }

    kontrolGuncelle(baziKontroller: Partial<SavasciKontrolleri>): void {
        if (this.savasci && this.yonetiliyor) {
            Object.assign(this.savasci.kontroller, baziKontroller);
            this.socket.emit('oyun bilgisi', {
                isim: this.savasci.isim,
                kontroller: baziKontroller,
                position: this.savasci.position,
                can: this.savasci.can,
            } as WarriorInformation);
        }
    }

    sendWarriorInformation(): void {
        if (this.savasci && this.yonetiliyor) {
            console.log('sending warrior information');
            this.socket.emit('oyun bilgisi', {
                isim: this.savasci.isim,
                kontroller: this.savasci.kontroller,
                position: this.savasci.position,
                can: this.savasci.can,
            } as WarriorInformation);
        }

    }
}