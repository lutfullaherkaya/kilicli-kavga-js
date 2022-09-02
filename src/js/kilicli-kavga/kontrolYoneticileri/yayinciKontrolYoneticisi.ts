import {KontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/kontrolYoneticisi";
import {Socket} from "socket.io-client";
import {OyunBilgisi, SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

export abstract class YayinciKontrolYoneticisi extends KontrolYoneticisi {
    private socket: Socket;

    protected constructor(galeAlinacakIsim: string, socket: Socket) {
        super(galeAlinacakIsim);
        this.socket = socket;
    }

    kontrolGuncelle(baziKontroller: Partial<SavasciKontrolleri>): void {
        if (this.kontroller && this.yonetiliyor) {
            Object.assign(this.kontroller, baziKontroller);
            this.socket.emit('oyun bilgisi', {
                isim: this.galeAlinacakIsim,
                kontroller: baziKontroller
            } as OyunBilgisi);
        }

    }
}
