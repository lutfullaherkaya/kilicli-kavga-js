<template>
    <div class="canvas-container" ref="canvas-container" style="width: 100%; height: 100%;">
        <div id="fps"
             style="position: absolute; top: 1px; left: 1px; color: white; font-size: 1rem; z-index: 111;"></div>
        <div class="genislik-sinirlayici" :style="{width: genislikSinirlayiciGenisligi}">
            <!-- bunun amaci tam ekran oldugunda kenarlara siyah cubuk koyabilmek -->
            <v-responsive :aspect-ratio="16/9">
                <canvas ref="game-canvas" style="width: 100%; height: 100%;"></canvas>

                <kilicli-kavga-oyunu-arayuz-can-zaman :tam-ekrandir="tamEkrandir"
                                                      :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                                                      @tam-ekrani-ac="tamEkraniAc"
                                                      @tam-ekrani-kapat="tamEkraniKapat"
                                                      :warriors="this.game?.warriors"
                                                      :canvas-client-width="canvasClientWidth"
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
import {Game} from "@/js/kilicli-kavga/game";
import {Sprite} from "@/js/kilicli-kavga/sprite";
import {WarriorCollision} from "@/js/kilicli-kavga/warriorCollision";
import {SavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/savasciKontrolYoneticisi";
import {KlavyeSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/klavyeSavasciKontrolYoneticisi";
import {MobilSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/mobilSavasciKontrolYoneticisi";
import {UzaktanSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/uzaktanSavasciKontrolYoneticisi";
import {Warrior, WarriorControls, SpriteBilgileri} from "@/js/kilicli-kavga/warrior";
import {YayinciSavasciKontrolYoneticisi} from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciSavasciKontrolYoneticisi";
import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";
import {SpriteWithSound} from "@/js/kilicli-kavga/spriteWithSound";

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
            game: null as null | Game,
            mobilKontrolYoneticisi: new MobilSavasciKontrolYoneticisi(this.socket),
            buSavasci: null as null | Warrior,
            canvasClientWidth: 1000,
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
        refreshCanvasClientWidth() {
            this.canvasClientWidth = (this.$refs['game-canvas'] as HTMLDivElement).clientWidth;
        },
        ekranBoyutuGuncelle(): void {
            this.ekranGenisligi = window.innerWidth;
            this.ekranYuksekligi = window.innerHeight;
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
        savasciEkle(tuval: Game, isim: SavasciAdi, spriteler: SpriteBilgileri, kontrolYoneticisi: SavasciKontrolYoneticisi | null = null): void {
            let position = new TwoDVector(150, tuval.height - 111);
            let sagaBakiyor;
            if (tuval.warriors.length == 0) {
                position = new TwoDVector(150, tuval.height - 111);
                sagaBakiyor = true;
            } else if (tuval.warriors.length == 1) {
                position = new TwoDVector(tuval.width - 200, tuval.height - 111);
                sagaBakiyor = false;
            } else { // ??????nc??den sonraki sava??????lar orta yukar??dan d????er.
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
                    tuval.groundLevelY,
                    50,
                    100,
                    sagaBakiyor,
                    kontrolYoneticisi,
            )

            tuval.warriors.push(yeniSavasci);
            tuval.entities.push(yeniSavasci);

            if (this.buOyuncuIsmi != "" && isim == this.buOyuncuIsmi) {
                this.buSavasci = yeniSavasci;
                this.mobilKontrolYoneticisi.yonetmeyeBasla(yeniSavasci);
            }
        },
        main() {
            this.game = new Game(document.querySelector('canvas'), tuvalGenisligi, tuvalYuksekligi, Math.round((tuvalYuksekligi / 600) * 490));


            const arkaplan = new Sprite(this.game, {
                resimKaynagi: './sprites/NightForest/Image without mist.png',
                skala: 1.72 * tuvalYuksekligi / 600,
            });


            this.darkSoulsaBenzeyenElemanSpriteleri = {
                sol: {
                    rolanti: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'rolanti',
                        yonuSagdir: false,

                    }),
                    kosu: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'kosu',
                        yonuSagdir: false,
                        soundSrc: 'sounds/half-life-walking.mp3',
                        soundLoops: true,
                    }),
                    donme: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'donme',
                        yonuSagdir: false,
                    }),
                    taklaAt: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: new TwoDVector(-130, -115),
                        skala: 2.7,
                        isim: 'taklaAt',
                        yonuSagdir: false,
                        sonsuzAnimasyon: false,
                        soundSrc: 'sounds/dark-souls-3-takla.mp3',
                        kacSahnedeResimDegisir: 6,
                    }),
                    zipla: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'zipla',
                        yonuSagdir: false,
                    }),
                    dusus: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'dusus',
                        yonuSagdir: false,
                    }),
                    saldiri1: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                        sonsuzAnimasyon: false,
                        soundSrc: 'sounds/sword-quick.mp3',
                    }),
                    saldiri2: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                        sonsuzAnimasyon: false,
                        soundSrc: 'sounds/sword-side.mp3',
                    }),
                    oldu: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Death.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-150, -115),
                        skala: 2.7,
                        isim: 'oldu',
                        yonuSagdir: false,
                        sonsuzAnimasyon: false,
                        sonundaSonSahneyiTut: true,
                        soundSrc: 'sounds/gta-wasted.mp3'
                    }),

                },
                sag: {
                    rolanti: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'rolanti',
                        yonuSagdir: true,
                    }),
                    kosu: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-126, -115),
                        skala: 2.7,
                        isim: 'kosu',
                        yonuSagdir: true,
                        soundSrc: 'sounds/half-life-walking.mp3',
                        soundLoops: true,

                    }),
                    donme: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-126, -115),
                        skala: 2.7,
                        isim: 'donme',
                        yonuSagdir: true,

                    }),
                    taklaAt: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        kacSahnedeResimDegisir: 6,
                        isim: 'taklaAt',
                        yonuSagdir: true,
                        sonsuzAnimasyon: false,
                        soundSrc: 'sounds/dark-souls-3-takla.mp3',
                    }),
                    zipla: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'zipla',
                        yonuSagdir: true,
                    }),
                    dusus: new Sprite(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'dusus',
                        yonuSagdir: true,
                    }),
                    saldiri1: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                        sonsuzAnimasyon: false,
                        soundSrc: 'sounds/sword-quick.mp3',
                    }),
                    saldiri2: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                        sonsuzAnimasyon: false,
                        soundSrc: 'sounds/sword-side.mp3',
                    }),
                    oldu: new SpriteWithSound(this.game, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Death.png',
                        resimSayisi: 10,
                        pozisyonOffset: new TwoDVector(-122, -115),
                        skala: 2.7,
                        isim: 'oldu',
                        yonuSagdir: true,
                        sonsuzAnimasyon: false,
                        sonundaSonSahneyiTut: true,
                        soundSrc: 'sounds/gta-wasted.mp3'
                    }),
                },
            };
            setInterval(() => {
                this.game!.setTimeLeftInUI();
            }, 1000);


            // https://stackoverflow.com/questions/4787431/check-fps-in-js
            // The higher this value, the less the fps will reflect temporary variations
            // A value of 1 will only keep the last value
            // 16.7ms yani 60 fps'den baslatiyoruz hesaplamaya.

            const filterStrength = 5;
            let avgFrameTime = 16.7, lastTimeStamp = performance.now();

            const canlandir = (timestamp: number) => {
                window.requestAnimationFrame(canlandir);
                const thisFrameTimeInMs = timestamp - lastTimeStamp;
                avgFrameTime += (thisFrameTimeInMs - avgFrameTime) / filterStrength;
                lastTimeStamp = timestamp;

                this.game!.thisFrameTimeInMs = thisFrameTimeInMs;
                this.game!.fps = 1000 / avgFrameTime;
                this.game!.cleanCanvas();
                arkaplan.start().update();
                for (const warrior of this.game!.warriors) {
                    warrior.update();
                }

                //WarriorCollision.engelle(this.game!.warriors);

            }
            const fpsOut = document.getElementById('fps');

            setInterval(function () {
                fpsOut!.innerHTML = (1000 / avgFrameTime).toFixed(1) + " fps";
            }, 1000);

            window.requestAnimationFrame(canlandir);
        }
    }
    ,
    mounted() {
        window.addEventListener('resize', this.ekranBoyutuGuncelle);
        window.addEventListener('fullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('mozfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('webkitfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('msfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('resize', this.refreshCanvasClientWidth); // in case ResizeObserver is not supported
        this.refreshCanvasClientWidth();
        new ResizeObserver(() => this.refreshCanvasClientWidth)
                .observe(this.$refs['game-canvas'] as HTMLDivElement);

        this.main();
        this.$watch('oyuncular', () => {
            if (this.game && this.oyuncular) {
                for (const oyuncu of this.oyuncular) {
                    let savasciIsimleri = this.game.warriors.map((savasci) => savasci.isim);
                    if (!savasciIsimleri.includes(oyuncu.isim)) {
                        if (this.buOyuncuIsmi != "" && oyuncu.isim == this.buOyuncuIsmi) {
                            let kontrolYoneticisi: SavasciKontrolYoneticisi | null = null;
                            kontrolYoneticisi = new KlavyeSavasciKontrolYoneticisi(this.socket, true, true, this.$refs['canvas-container'] as HTMLElement)
                            this.savasciEkle(this.game!, oyuncu.isim, this.darkSoulsaBenzeyenElemanSpriteleri, kontrolYoneticisi);
                            // always using mouse and keybaord, sometimes using mobile
                        } else {
                            this.savasciEkle(this.game!, oyuncu.isim, this.darkSoulsaBenzeyenElemanSpriteleri, new UzaktanSavasciKontrolYoneticisi(this.socket));
                        }
                    }
                }
                const oyuncuIsimleri = this.oyuncular.map((oyuncu) => oyuncu.isim);
                this.game.warriors = this.game.warriors.filter((savasci) => {
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
        window.removeEventListener('resize', this.refreshCanvasClientWidth);

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
