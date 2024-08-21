import {Dikdortgen} from "@/js/kilicli-kavga/utility/dikdortgen";
import {Warrior} from "@/js/kilicli-kavga/warrior";

export class WarriorCollision {
    static engelle(warriors: Warrior[]) {
        warriors.forEach((savaskar1) => {
            warriors.forEach((savaskar2) => {
                if (savaskar1 !== savaskar2) {
                    WarriorCollision.carpismayacakKadarOtele(savaskar1, savaskar2);
                }
            });
        });
    }

    /**
     * @param savasci1 ötelenecek nesne
     * @param savasci2
     */
    static carpismayacakKadarOtele(savasci1: Warrior, savasci2: Warrior) {
        if (Dikdortgen.carpisir(savasci1.hitbox, savasci2.hitbox)) {
            if (Math.abs(savasci1.hitbox.merkezKordinat().y - savasci2.hitbox.merkezKordinat().y) <
                Math.abs(savasci1.hitbox.merkezKordinat().x - savasci2.hitbox.merkezKordinat().x)) {
                WarriorCollision.yataydaKenarinaOtele(savasci1, savasci2);
                savasci1.accel.x = 0;
                savasci1.v.x = 0;
            } else {
                WarriorCollision.duseydeKenarinaOtele(savasci1, savasci2);
                savasci1.v.y = 0;
                savasci1.accel.y = 0;
            }
        }
    }

    static duseydeKenarinaOtele(savasci1: Warrior, savasci2: Warrior) {
        if (savasci1.hitbox.merkezKordinat().y < savasci2.hitbox.merkezKordinat().y) { // yukarisinda olacak
            savasci1.hitbox.pos.y = savasci2.hitbox.pos.y - savasci1.hitbox.h;
        } else if (savasci1.hitbox.merkezKordinat().y >= savasci2.hitbox.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savasci2.hitbox.pos.y + savasci2.hitbox.h;
            if (yeniYPozisyonu < savasci1.game.groundLevelY - savasci1.hitbox.h) {
                savasci1.hitbox.pos.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    static yataydaKenarinaOtele(savasci1: Warrior, savasci2: Warrior) {
        if (savasci1.hitbox.merkezKordinat().x < savasci2.hitbox.merkezKordinat().x) { // solunda olacak
            savasci1.hitbox.pos.x = savasci2.hitbox.pos.x - savasci1.hitbox.w;
        } else if (savasci1.hitbox.merkezKordinat().x > savasci2.hitbox.merkezKordinat().x) { // saginda olacak
            savasci1.hitbox.pos.x = savasci2.hitbox.pos.x + savasci2.hitbox.w;
        }
    }
}
