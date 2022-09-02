import {Dikdortgen} from "@/js/kilicli-kavga/utility/dikdortgen";
import {Warrior} from "@/js/kilicli-kavga/warrior";

export class SavasciCarpisma {
    static engelle() {
        Warrior.s.forEach((savaskar1) => {
            Warrior.s.forEach((savaskar2) => {
                if (savaskar1 !== savaskar2) {
                    SavasciCarpisma.carpismayacakKadarOtele(savaskar1, savaskar2);
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
                SavasciCarpisma.yataydaKenarinaOtele(savasci1, savasci2);
                savasci1.acceleration.x = 0;
                savasci1.velocity.x = 0;
            } else {
                SavasciCarpisma.duseydeKenarinaOtele(savasci1, savasci2);
                savasci1.velocity.y = 0;
                savasci1.acceleration.y = 0;
            }
        }
    }

    static duseydeKenarinaOtele(savasci1: Warrior, savasci2: Warrior) {
        if (savasci1.hitbox.merkezKordinat().y < savasci2.hitbox.merkezKordinat().y) { // yukarisinda olacak
            savasci1.hitbox.position.y = savasci2.hitbox.position.y - savasci1.hitbox.yukseklik;
        } else if (savasci1.hitbox.merkezKordinat().y >= savasci2.hitbox.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savasci2.hitbox.position.y + savasci2.hitbox.yukseklik;
            if (yeniYPozisyonu < savasci1.tuval.yerKordinati - savasci1.hitbox.yukseklik) {
                savasci1.hitbox.position.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    static yataydaKenarinaOtele(savasci1: Warrior, savasci2: Warrior) {
        if (savasci1.hitbox.merkezKordinat().x < savasci2.hitbox.merkezKordinat().x) { // solunda olacak
            savasci1.hitbox.position.x = savasci2.hitbox.position.x - savasci1.hitbox.genislik;
        } else if (savasci1.hitbox.merkezKordinat().x > savasci2.hitbox.merkezKordinat().x) { // saginda olacak
            savasci1.hitbox.position.x = savasci2.hitbox.position.x + savasci2.hitbox.genislik;
        }
    }
}
