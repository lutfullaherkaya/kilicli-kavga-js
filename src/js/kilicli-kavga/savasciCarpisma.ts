import {Dikdortgen} from "@/js/kilicli-kavga/dikdortgen";
import {Savasci} from "@/js/kilicli-kavga/savasci";

export class SavasciCarpisma {
    static engelle() {
        Savasci.lar.forEach((savaskar1) => {
            Savasci.lar.forEach((savaskar2) => {
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
    static carpismayacakKadarOtele(savasci1: Savasci, savasci2: Savasci) {
        if (Dikdortgen.carpisir(savasci1.hitKutusu, savasci2.hitKutusu)) {
            if (Math.abs(savasci1.hitKutusu.merkezKordinat().y - savasci2.hitKutusu.merkezKordinat().y) <
                Math.abs(savasci1.hitKutusu.merkezKordinat().x - savasci2.hitKutusu.merkezKordinat().x)) {
                SavasciCarpisma.yataydaKenarinaOtele(savasci1, savasci2);
                savasci1.ivme.x = 0;
                savasci1.hiz.x = 0;
            } else {
                SavasciCarpisma.duseydeKenarinaOtele(savasci1, savasci2);
                savasci1.hiz.y = 0;
                savasci1.ivme.y = 0;
            }
        }
    }

    static duseydeKenarinaOtele(savasci1: Savasci, savasci2: Savasci) {
        if (savasci1.hitKutusu.merkezKordinat().y < savasci2.hitKutusu.merkezKordinat().y) { // yukarisinda olacak
            savasci1.hitKutusu.position.y = savasci2.hitKutusu.position.y - savasci1.hitKutusu.yukseklik;
        } else if (savasci1.hitKutusu.merkezKordinat().y >= savasci2.hitKutusu.merkezKordinat().y) { // asagisinda olacak
            const yeniYPozisyonu = savasci2.hitKutusu.position.y + savasci2.hitKutusu.yukseklik;
            if (yeniYPozisyonu < savasci1.tuval.yerKordinati - savasci1.hitKutusu.yukseklik) {
                savasci1.hitKutusu.position.y = yeniYPozisyonu;
            } // aksi taktirde yerin dibine girer, o durumda oteleme yapilmaz.
        }
    }

    static yataydaKenarinaOtele(savasci1: Savasci, savasci2: Savasci) {
        if (savasci1.hitKutusu.merkezKordinat().x < savasci2.hitKutusu.merkezKordinat().x) { // solunda olacak
            savasci1.hitKutusu.position.x = savasci2.hitKutusu.position.x - savasci1.hitKutusu.genislik;
        } else if (savasci1.hitKutusu.merkezKordinat().x > savasci2.hitKutusu.merkezKordinat().x) { // saginda olacak
            savasci1.hitKutusu.position.x = savasci2.hitKutusu.position.x + savasci2.hitKutusu.genislik;
        }
    }
}
