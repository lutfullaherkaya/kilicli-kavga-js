<template>
    <div class="canvas-container" ref="canvas-container" style="width: 100%; height: 100%;">
        <div id="fps"
             style="position: absolute; top: 1px; left: 1px; color: white; font-size: 1rem; z-index: 111;"></div>
        <div class="genislik-sinirlayici" :style="{width: genislikSinirlayiciGenisligi}">
            <!-- bunun amaci tam ekran oldugunda kenarlara siyah cubuk koyabilmek -->
            <v-responsive :aspect-ratio="16/9">
                <canvas style="width: 100%; height: 100%;"></canvas>

                <kilicli-kavga-oyunu-arayuz-can-zaman :tam-ekrandir="tamEkrandir"
                                                      :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                                                      @tam-ekrani-ac="tamEkraniAc"
                                                      @tam-ekrani-kapat="tamEkraniKapat"
                                                      :warriors="this.tuval?.warriors"
                />
<!--                <div style="width: 40px; height: 30px; position: absolute; left: 0; top: 0; background-color: red;"
                     id="kutu">
                </div>-->
            </v-responsive>
        </div>
        <kilicli-kavga-oyunu-arayuz-mobil v-if="mobilKontrolleriGoster" style="z-index: 1111;"
                                          @mobil-kontroller-degisti="mobilKontrollerDegisince"
        />


    </div>
</template>
<script lang="ts">
import KilicliKavgaOyunuArayuzCanZaman from '@/components/KilicliKavgaOyunuArayuzCanZaman.vue'
import KilicliKavgaOyunuArayuzMobil from '@/components/KilicliKavgaOyunuArayuzMobil.vue'
import Vue from "vue";
import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Sprite} from "@/js/kilicli-kavga/sprite";
import {WarriorCollision} from "@/js/kilicli-kavga/warriorCollision";
import {SavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/savasciKontrolYoneticisi";
import {KlavyeSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/klavyeSavasciKontrolYoneticisi";
import {MobilSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/mobilSavasciKontrolYoneticisi";
import {UzaktanSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/uzaktanSavasciKontrolYoneticisi";
import {Warrior, WarriorControls, SpriteBilgileri} from "@/js/kilicli-kavga/warrior";
import {YayinciSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciSavasciKontrolYoneticisi";
import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";

type SavasciAdi = string;

const tuvalYuksekligi = 720;
const tuvalGenisligi = tuvalYuksekligi * 16 / 9;

export default Vue.extend({
    name: 'KilicliKavgaOyunuOyun',
    components: {KilicliKavgaOyunuArayuzMobil, KilicliKavgaOyunuArayuzCanZaman},
    props: {
        dokunmalidir: Boolean,
        mobilKontrolleriGoster: Boolean,
        socket: Object,
        oyuncular: Array as () => Array<{ isim: SavasciAdi }>,
        buOyuncuIsmi: String,
    },
    data() {
        return {
            tamEkrandir: false,
            ekranGenisligi: 100,
            ekranYuksekligi: 100,
            darkSoulsaBenzeyenElemanSpriteleri: null as any,
            tuval: null as null | Tuval,
            mobilKontrolYoneticisi: new MobilSavasciKontrolYoneticisi(this.socket),
            buSavasci: null as null | Warrior,
        }
    },
    watch: {},
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
            const elem = this.$refs["canvas-container"] as HTMLElement & {
                mozRequestFullScreen(): Promise<void>;
                webkitRequestFullscreen(): Promise<void>;
                msRequestFullscreen(): Promise<void>;
            };
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        },
        tamEkraniKapat(): void {
            const docWithBrowsersExitFunctions = document as Document & {
                mozCancelFullScreen(): Promise<void>;
                webkitExitFullscreen(): Promise<void>;
                msExitFullscreen(): Promise<void>;
            };
            if (docWithBrowsersExitFunctions.exitFullscreen) {
                docWithBrowsersExitFunctions.exitFullscreen();
            } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) { /* Safari */
                docWithBrowsersExitFunctions.webkitExitFullscreen();
            } else if (docWithBrowsersExitFunctions.msExitFullscreen) { /* IE11 */
                docWithBrowsersExitFunctions.msExitFullscreen();
            }
        },
        mobilKontrollerDegisince(baziKontroller: Partial<WarriorControls>): void {
            this.mobilKontrolYoneticisi.kontrolGuncelle(baziKontroller);
        },
        savasciEkle(tuval: Tuval, isim: SavasciAdi, spriteler: SpriteBilgileri, kontrolYoneticisi: SavasciKontrolYoneticisi | null = null): void {
            let position = new TwoDVector(150, tuval.canvas.height - 111);
            let sagaBakiyor;
            if (tuval.warriors.length == 0) {
                position = new TwoDVector(150, tuval.canvas.height - 111);
                sagaBakiyor = true;
            } else if (tuval.warriors.length == 1) {
                position = new TwoDVector(tuval.canvas.width - 200, tuval.canvas.height - 111);
                sagaBakiyor = false;
            } else { // üçüncüden sonraki savaşçılar orta yukarıdan düşer.
                position = new TwoDVector(1920 / 2 + 25, -100);
                sagaBakiyor = false;
            }
            const yeniSavasci = new Warrior(isim,
                    tuval,
                    spriteler,
                    position,
                    undefined,
                    undefined,
                    true,
                    tuval.yerKordinati,
                    50,
                    100,
                    sagaBakiyor,
                    kontrolYoneticisi,
            )

            tuval.warriors.push(yeniSavasci);

            if (this.buOyuncuIsmi != "" && isim == this.buOyuncuIsmi) {
                this.buSavasci = yeniSavasci;
                this.mobilKontrolYoneticisi.yonetmeyeBasla(yeniSavasci);
            }
        },
        main() {
            this.tuval = new Tuval(document.querySelector('canvas')!, tuvalGenisligi, tuvalYuksekligi, Math.round((tuvalYuksekligi / 600) * 490));


            const arkaplan = new Sprite(this.tuval, {
                resimKaynagi: './sprites/NightForest/Image without mist.png',
                skala: 1.72 * tuvalYuksekligi / 600,
                canvasFilter: 'contrast(2) sepia(1)'
            });


            this.darkSoulsaBenzeyenElemanSpriteleri = {
                sol: {
                    rolanti: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'rolanti',
                        yonuSagdir: false,
                    }),
                    kosu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'kosu',
                        yonuSagdir: false,
                    }),
                    donme: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'donme',
                        yonuSagdir: false,
                    }),
                    taklaAt: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: new TwoDVector(-130, -115),
                        skala: 2.7,
                        isim: 'taklaAt',
                        yonuSagdir: false,
                    }),
                    zipla: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'zipla',
                        yonuSagdir: false,
                    }),
                    dusus: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'dusus',
                        yonuSagdir: false,
                    }),
                    saldiri1: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                    }),
                    saldiri2: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                    }),
                    oldu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Death.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'oldu',
                        yonuSagdir: false,
                        sonsuzAnimasyon: false,
                        sonundaSonSahneyiTut: true,
                    }),

                },
                sag: {
                    rolanti: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'rolanti',
                        yonuSagdir: true,
                    }),
                    kosu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-126, -115),
                        skala: 2.7,
                        isim: 'kosu',
                        yonuSagdir: true,
                    }),
                    donme: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-126, -115),
                        skala: 2.7,
                        isim: 'donme',
                        yonuSagdir: true,
                    }),
                    taklaAt: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,

                        isim: 'taklaAt',
                        yonuSagdir: true,
                    }),
                    zipla: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'zipla',
                        yonuSagdir: true,
                    }),
                    dusus: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'dusus',
                        yonuSagdir: true,
                    }),
                    saldiri1: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                    }),
                    saldiri2: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                    }),
                    oldu: new Sprite(this.tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Death.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'oldu',
                        yonuSagdir: true,
                        sonsuzAnimasyon: false,
                        sonundaSonSahneyiTut: true,
                    }),
                },
            };
            setInterval(() => {
                this.tuval!.setZamanKutucugu();
            }, 1000);


            // https://stackoverflow.com/questions/4787431/check-fps-in-js
            // The higher this value, the less the fps will reflect temporary variations
            // A value of 1 will only keep the last value
            // 16.7ms yani 60 fps'den baslatiyoruz hesaplamaya.

            const filterStrength = 5;
            let frameTime = 16.7, lastLoop = performance.now(), thisLoop;
            let currentFrame = 0;
            const canlandir = () => {
                window.requestAnimationFrame(canlandir);
                this.tuval!.fps = 1000 / frameTime;
                this.tuval!.temizle();
                arkaplan.update();
                for (const warrior of this.tuval!.warriors) {
                    warrior.update();
                }

                WarriorCollision.engelle(this.tuval!.warriors);

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
        this.$watch('oyuncular', () => {
            if (this.tuval) {
                for (const oyuncu of this.oyuncular) {
                    let savasciIsimleri = this.tuval.warriors.map((savasci) => savasci.isim);
                    if (!savasciIsimleri.includes(oyuncu.isim)) {
                        if (this.buOyuncuIsmi != "" && oyuncu.isim == this.buOyuncuIsmi) {
                            let kontrolYoneticisi: SavasciKontrolYoneticisi | null = null;
                            kontrolYoneticisi = new KlavyeSavasciKontrolYoneticisi(this.socket, true, true, this.$refs['canvas-container'] as HTMLElement)
                            this.savasciEkle(this.tuval!, oyuncu.isim, this.darkSoulsaBenzeyenElemanSpriteleri, kontrolYoneticisi);
                            // always using mouse and keybaord, sometimes using mobile
                        } else {
                            this.savasciEkle(this.tuval!, oyuncu.isim, this.darkSoulsaBenzeyenElemanSpriteleri, new UzaktanSavasciKontrolYoneticisi(this.socket));
                        }
                    }
                }
                const oyuncuIsimleri = this.oyuncular.map((oyuncu) => oyuncu.isim);
                this.tuval.warriors = this.tuval.warriors.filter((savasci) => {
                    if (!oyuncuIsimleri.includes(savasci.isim)) {
                        savasci.kontrolYoneticisi?.yonetmeyiBirak();
                        return false;
                    }
                    return true;
                });
                (this.buSavasci?.kontrolYoneticisi as YayinciSavasciKontrolYoneticisi).sendWarriorInformation();
            }

        }, {immediate: true});
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
