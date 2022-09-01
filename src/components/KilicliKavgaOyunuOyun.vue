<template>
    <div class="canvas-container" ref="canvas-container" style="width: 100%; height: 100%;">
        <div id="fps" style="position: absolute; top: 1px; left: 1px; color: white; font-size: 0.5rem;"></div>
        <div class="genislik-sinirlayici" :style="{width: genislikSinirlayiciGenisligi}">
            <!-- bunun amaci tam ekran oldugunda kenarlara siyah cubuk koyabilmek -->
            <v-responsive :aspect-ratio="16/9">
                <canvas style="width: 100%; height: 100%;"></canvas>
                <kilicli-kavga-oyunu-arayuz @tam-ekrani-ac="tamEkraniAc"
                                            @tam-ekrani-kapat="tamEkraniKapat"
                                            @mobil-kontroller-degisti="mobilKontrollerDegisince"
                                            :tam-ekrandir="tamEkrandir"
                                            :mobil-kontrolleri-goster="mobilKontrolleriGoster"

                ></kilicli-kavga-oyunu-arayuz>
            </v-responsive>
        </div>

    </div>
</template>
<script lang="ts">
import KilicliKavgaOyunuArayuz from '@/components/KilicliKavgaOyunuArayuz.vue'
import {io} from "socket.io-client";
import {
    Savasci,
    SavasciCarpisma,
    SavasciKontrolleri,
    Sprite,
    Tuval,
    KlavyeKontrolYoneticisi,
    KontrolYoneticisi, MobilKontrolYoneticisi, UzaktanKontrolYoneticisi
} from "@/js/oyn";
import axios from "axios";
import Vue from "vue";

type SavasciAdi = string;

const tuvalYuksekligi = 768;
const tuvalGenisligi = 1366;

export default Vue.extend({
    name: 'KilicliKavgaOyunuOyun',
    components: {KilicliKavgaOyunuArayuz},
    props: {
        mobildir: Boolean,
        mobilKontrolleriGoster: Boolean,
        socket: Object,
        oyuncular: Array as () => Array<{ isim: SavasciAdi }>,
        buOyuncuIsmi: String,
    },
    data() {
        return {
            savascilar: {} as { [key: SavasciAdi]: Savasci }, // bundan dolayı bir isimli tek savaşçı olabilir.
            tamEkrandir: false,
            ekranGenisligi: 100,
            ekranYuksekligi: 100,
            darkSoulsaBenzeyenElemanSpriteleri: null as any,
            tuval: null as null | Tuval,
            mobilKontrolYoneticisi: new MobilKontrolYoneticisi(),
        }
    },
    computed: {
        genislikSinirlayiciGenisligi(): string {
            if (this.tamEkrandir && this.ekranGenisligi / this.ekranYuksekligi >= 16 / 9) {
                return this.ekranYuksekligi * 16 / 9 + 'px';
            } else {
                return '100%';
            }
        }
    },
    methods: {
        ekranBoyutuGuncelle(): void {
            this.ekranGenisligi = window.outerWidth;
            this.ekranYuksekligi = window.outerHeight;
        },
        tamEkranGuncelle(): void {
            this.tamEkrandir = Boolean(document.fullscreenElement);
        },
        tamEkraniAc(): void {
            const elem = this.$refs["canvas-container"] as HTMLDivElement;
            if (elem.requestFullscreen
            ) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        },
        tamEkraniKapat(): void {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        },
        mobilKontrollerDegisince(baziKontroller: Partial<SavasciKontrolleri>): void {
            this.mobilKontrolYoneticisi.kontrolGuncelle(baziKontroller);
        },
        kontrolGuncelle(kaynakKontroller: SavasciKontrolleri): void {
            /*this.socket.emit('oyun bilgisi', {
                isim: this.oyuncuIsmi,
                kontroller: kaynakKontroller,
            });*/
        },
        savasciEkle(tuval: Tuval, isim: SavasciAdi, spriteler: Sprite[], kontrolYoneticisi: KontrolYoneticisi | null = null): void {
            const savasciSayisi = Object.keys(this.savascilar).length;
            let pozisyon = {x: 150, y: tuval.canvas.height - 111};
            let canCubuguID;
            let canCubuguIsimID;
            let sagaBakiyor;
            if (savasciSayisi == 0) {
                pozisyon = {x: 150, y: tuval.canvas.height - 111};
                canCubuguID = 'ic-can-cubugu-1';
                canCubuguIsimID = 'can-cubugu-isim-1';
                sagaBakiyor = true;
            } else if (savasciSayisi == 1) {
                pozisyon = {x: tuval.canvas.width - 200, y: tuval.canvas.height - 111};
                canCubuguID = 'ic-can-cubugu-2';
                canCubuguIsimID = 'can-cubugu-isim-2';
                sagaBakiyor = false;
            } else { // üçüncüden sonraki savaşçılar orta yukarıdan düşer.
                pozisyon = {x: 1920 / 2 + 25, y: -100};
                canCubuguID = 'ic-can-cubugu-2';
                canCubuguIsimID = 'can-cubugu-isim-2';
                sagaBakiyor = false;
                // todo: üçüncü ve sonrası karakterlere can çubuğu ekle
            }
            console.log(isim);
            const yeniSavasci = new Savasci(tuval, {
                renk: 'rgba(255,0,0,0.5)',
                pozisyon,
                sagaBakiyor,
                kontrolYoneticisi,
                genislik: 50,
                yukseklik: 100,
                isim: isim,
                canCubuguID,
                canCubuguIsimID,
                spriteler,
            });
            this.$set(this.savascilar, yeniSavasci.isim, yeniSavasci);
        },
        main() {
            this.tuval = new Tuval(document.querySelector('canvas')!, tuvalGenisligi, tuvalYuksekligi, (tuvalYuksekligi / 600) * 490);
            this.$watch('oyuncular', () => {
                for (const oyuncu of this.oyuncular) {
                    if (!(oyuncu.isim in this.savascilar)) {
                        if (this.buOyuncuIsmi != "" && oyuncu.isim == this.buOyuncuIsmi) {
                            let kontrolYoneticisi : KontrolYoneticisi | null = null;
                            if (this.mobildir) {
                                kontrolYoneticisi = this.mobilKontrolYoneticisi;
                            } else {
                                kontrolYoneticisi = new KlavyeKontrolYoneticisi(oyuncu.isim, this.socket, true, true, this.$refs['canvas-container'] as HTMLElement)
                            }
                            this.savasciEkle(this.tuval!, oyuncu.isim, this.darkSoulsaBenzeyenElemanSpriteleri, kontrolYoneticisi);
                        } else {
                            this.savasciEkle(this.tuval!, oyuncu.isim, this.darkSoulsaBenzeyenElemanSpriteleri, new UzaktanKontrolYoneticisi(this.socket, oyuncu.isim));
                        }

                        /*this.savasciEkle(this.tuval!, 'as', this.darkSoulsaBenzeyenElemanSpriteleri,
                                new KlavyeKontrolYoneticisi(false
                                ));*/
                        /*
                                                this.savasciEkle(this.tuval!, 'sa', this.darkSoulsaBenzeyenElemanSpriteleri, this.mobilKontrolYoneticisi);
                        */
                    }
                }
                const savasciIsimleri = Object.values(this.savascilar).map((savasci) => savasci.isim);
                for (const savasciIsmi of savasciIsimleri) {
                    if (this.oyuncular.map((oyuncu) => oyuncu.isim).indexOf(savasciIsmi) == -1) {
                        Savasci.savasciCikar(this.savascilar[savasciIsmi]);
                        this.$delete(this.savascilar, savasciIsmi);
                    }
                }
            })

            const arkaplan = new Sprite(this.tuval, {
                pozisyon: {
                    x: 0,
                    y: 0,
                },
                resimKaynagi: './sprites/NightForest/Image without mist.png',
                skala: 1.72 * tuvalYuksekligi / 600,
            });

            this.darkSoulsaBenzeyenElemanSpriteleri = {
                sol: {
                    rolanti: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'rolanti',
                        yonuSagdir: false,
                    }),
                    kosu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -140, y: -115},
                        skala: 1,
                        isim: 'kosu',
                        yonuSagdir: false,
                    }),
                    donme: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -140, y: -115},
                        skala: 1,
                        isim: 'donme',
                        yonuSagdir: false,
                    }),
                    taklaAt: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,

                        isim: 'taklaAt',
                        yonuSagdir: false,
                    }),
                    zipla: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'zipla',
                        yonuSagdir: false,
                    }),

                    dusus: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'dusus',
                        yonuSagdir: false,
                    }),
                    saldiri1: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                    }),
                    saldiri2: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                    }),
                    oldu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Death.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -130, y: -115}, // pozisyonOffset: { x: -45, y: -165 },
                        skala: 1,
                        isim: 'oldu',
                        yonuSagdir: false,
                        sonsuzAnimasyon: false,
                        sonundaSonSahneyiTut: true,
                    }),

                },
                sag: {
                    rolanti: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'rolanti',
                        yonuSagdir: true,
                    }),
                    kosu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -126, y: -115},
                        skala: 1,
                        isim: 'kosu',
                        yonuSagdir: true,
                    }),
                    donme: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -126, y: -115},
                        skala: 1,
                        isim: 'donme',
                        yonuSagdir: true,
                    }),
                    taklaAt: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,

                        isim: 'taklaAt',
                        yonuSagdir: true,
                    }),
                    zipla: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'zipla',
                        yonuSagdir: true,
                    }),
                    dusus: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'dusus',
                        yonuSagdir: true,
                    }),
                    saldiri1: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                    }),
                    saldiri2: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                    }),
                    oldu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Death.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -122, y: -115},  // pozisyonOffset: { x: -45, y: -165 },
                        skala: 1,
                        isim: 'oldu',
                        yonuSagdir: true,
                        sonsuzAnimasyon: false,
                        sonundaSonSahneyiTut: true,
                    }),
                },
            };
            setInterval(() => {
                this.tuval.setZamanKutucugu();
            }, 1000);
            (this.$refs["canvas-container"] as HTMLDivElement).addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });


            // https://stackoverflow.com/questions/4787431/check-fps-in-js
            // The higher this value, the less the fps will reflect temporary variations
            // A value of 1 will only keep the last value
            // 16.7ms yani 60 fps'den baslatiyoruz hesaplamaya.

            const filterStrength = 5;
            let frameTime = 16.7, lastLoop = performance.now(), thisLoop;

            const canlandir = () => {
                window.requestAnimationFrame(canlandir);
                this.tuval.fps = 1000 / frameTime;
                this.tuval.temizle();
                arkaplan.guncelle();
                for (const savasciAdi in this.savascilar) {
                    this.savascilar[savasciAdi as SavasciAdi].guncelle();
                }
                SavasciCarpisma.engelle();

                const thisFrameTime = (thisLoop = performance.now()) - lastLoop;
                frameTime += (thisFrameTime - frameTime) / filterStrength;
                lastLoop = thisLoop;

            }
            const fpsOut = document.getElementById('fps');

            setInterval(function () {
                fpsOut!.innerHTML = (1000 / frameTime).toFixed(1) + " fps";
            }, 1000);

            canlandir();
        }
    }
    ,
    mounted() {
        window.addEventListener('resize', this.ekranBoyutuGuncelle);
        window.addEventListener('fullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('mozfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('webkitfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('msfullscreenchange', this.tamEkranGuncelle);

        this.main();
    },

    destroyed() {
        window.removeEventListener('resize', this.ekranBoyutuGuncelle);
        window.removeEventListener('fullscreenchange', this.tamEkranGuncelle);
        window.removeEventListener('mozfullscreenchange', this.tamEkranGuncelle);
        window.removeEventListener('webkitfullscreenchange', this.tamEkranGuncelle);
        window.removeEventListener('msfullscreenchange', this.tamEkranGuncelle);

    }
})
;

</script>
<style scoped lang="scss">


canvas, img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

.canvas-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

}

.genislik-sinirlayici {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}


</style>
