<template>
    <div class="canvas-container" ref="canvas-container" style="width: 100%; height: 100%;">
        <div id="fps" style="position: absolute; top: 1px; left: 1px; color: white; font-size: 0.5rem;"></div>
        <div class="genislik-sinirlayici" :style="{width: genislikSinirlayiciGenisligi}">
            <!-- bunun amaci tam ekran oldugunda kenarlara siyah cubuk koyabilmek -->
            <v-responsive :aspect-ratio="16/9">
                <canvas style="width: 100%; height: 100%;"></canvas>
                <kilicli-kavga-oyunu-arayuz @tam-ekrani-ac="tamEkraniAc"
                                            @tam-ekrani-kapat="tamEkraniKapat"
                                            @kontroller-degisti="kontrolGuncelle(oyuncuKontroller, $event)"
                                            :tam-ekrandir="tamEkrandir"
                                            :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                                            :savasci-kontrolleri-mobil="oyuncuKontroller"

                ></kilicli-kavga-oyunu-arayuz>
            </v-responsive>
        </div>

    </div>
</template>
<script lang="ts">
import KilicliKavgaOyunuArayuz from '@/components/KilicliKavgaOyunuArayuz.vue'
import {io} from "socket.io-client";
import {Savasci, SavasciCarpisma, SavasciKontrolleri, Sprite, Tuval} from "@/js/oyn";
import axios from "axios";
import Vue from "vue";

export default Vue.extend({
    name: 'KilicliKavgaOyunuOyun',
    components: {KilicliKavgaOyunuArayuz},
    props: {
        mobildir: Boolean,
        mobilKontrolleriGoster: Boolean,
    },
    data() {
        return {
            oyuncular: [] as any[],
            tamEkrandir: false,
            ekranGenisligi: 100,
            ekranYuksekligi: 100,
            socket: io(),
            oyuncuKontroller: {
                solKosu: false,
                sagKosu: false,
                sonKosulanYonSagdir: false,
                saldiri: false,
                taklaAt: false,
                zipla: false,
            } as SavasciKontrolleri,
            oyuncu2Kontroller: {
                solKosu: false,
                sagKosu: false,
                sonKosulanYonSagdir: false,
                saldiri: false,
                taklaAt: false,
                zipla: false,
            } as SavasciKontrolleri,
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
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        },
        tamEkraniKapat() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        },
        kontrolGuncelle(hedefKontroller: SavasciKontrolleri, kaynakKontroller: SavasciKontrolleri): void {
            Object.assign(hedefKontroller, kaynakKontroller);
        },
        main() {
            const tuvalYuksekligi = 768;
            const tuvalGenisligi = 1366;
            const tuval = new Tuval(document.querySelector('canvas')!, tuvalGenisligi, tuvalYuksekligi, (tuvalYuksekligi / 600) * 490);

            setInterval(() => {
                tuval.setZamanKutucugu();
            }, 1000)
            const arkaplan = new Sprite(tuval, {
                pozisyon: {
                    x: 0,
                    y: 0,
                },
                resimKaynagi: './sprites/NightForest/Image without mist.png',
                skala: 1.72 * tuvalYuksekligi / 600,
            });

            const spriteler = {
                sol: {
                    rolanti: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'rolanti',
                        yonuSagdir: false,
                    }),
                    kosu: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -140, y: -115},
                        skala: 1,
                        isim: 'kosu',
                        yonuSagdir: false,
                    }),
                    donme: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -140, y: -115},
                        skala: 1,
                        isim: 'donme',
                        yonuSagdir: false,
                    }),
                    taklaAt: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,

                        isim: 'taklaAt',
                        yonuSagdir: false,
                    }),
                    zipla: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'zipla',
                        yonuSagdir: false,
                    }),

                    dusus: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'dusus',
                        yonuSagdir: false,
                    }),
                    saldiri1: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                    }),
                    saldiri2: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_left/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: {x: -130, y: -115},
                        skala: 1,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: false,
                    }),
                    oldu: new Sprite(tuval, {
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
                    rolanti: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Idle.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'rolanti',
                        yonuSagdir: true,
                    }),
                    kosu: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Run.png',
                        resimSayisi: 10,
                        pozisyonOffset: {x: -126, y: -115},
                        skala: 1,
                        isim: 'kosu',
                        yonuSagdir: true,
                    }),
                    donme: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_TurnAround.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -126, y: -115},
                        skala: 1,
                        isim: 'donme',
                        yonuSagdir: true,
                    }),
                    taklaAt: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Roll.png',
                        resimSayisi: 12,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,

                        isim: 'taklaAt',
                        yonuSagdir: true,
                    }),
                    zipla: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Jump.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'zipla',
                        yonuSagdir: true,
                    }),
                    dusus: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Fall.png',
                        resimSayisi: 3,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'dusus',
                        yonuSagdir: true,
                    }),
                    saldiri1: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_AttackNoMovement.png',
                        resimSayisi: 4,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'saldiri1',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                    }),
                    saldiri2: new Sprite(tuval, {
                        resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/PNGSheets_right/_Attack2NoMovement.png',
                        resimSayisi: 6,
                        pozisyonOffset: {x: -122, y: -115},
                        skala: 1,
                        isim: 'saldiri2',
                        kacSahnedeResimDegisir: 7,
                        yonuSagdir: true,
                    }),
                    oldu: new Sprite(tuval, {
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
            const oyuncu = new Savasci(tuval, {
                renk: 'rgba(255,0,0,0.5)',
                pozisyon: {x: 150, y: tuval.canvas.height - 111},
                sagaBakiyor: true,
                kontroller: this.oyuncuKontroller,

                genislik: 50,
                yukseklik: 100,
                isim: 'lutfullah',
                canCubuguID: 'ic-can-cubugu-1',
                canCubuguIsimID: 'can-cubugu-isim-1',
                spriteler,
            });
            const oyuncu2 = new Savasci(tuval, {
                renk: 'rgba(255,0,0,0.5)',
                pozisyon: {x: 600, y: 0},
                sagaBakiyor: false,
                kontroller: this.oyuncu2Kontroller,
                genislik: 50,
                yukseklik: 100,
                isim: 'o',
                canCubuguID: 'ic-can-cubugu-2',
                canCubuguIsimID: 'can-cubugu-isim-2',
                spriteler,
            });

            window.addEventListener('keydown', (event: KeyboardEvent) => {
                const birinciOyuncuTuslari = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ö', 'Ö'];
                switch (event.key) {
                    case 'ArrowLeft':
                        this.oyuncuKontroller.solKosu = true;
                        this.oyuncuKontroller.sonKosulanYonSagdir = false;
                        break;
                    case 'ArrowRight':
                        this.oyuncuKontroller.sagKosu = true;
                        this.oyuncuKontroller.sonKosulanYonSagdir = true;
                        break;
                    case 'ArrowUp':
                        if (!event.repeat) {
                            this.oyuncuKontroller.zipla = true;
                        }

                        break;
                    case 'ArrowDown':
                        if (!event.repeat) {
                            this.oyuncuKontroller.saldiri = true;
                        }
                        break;
                    case 'ö':
                    case 'Ö':
                        if (!event.repeat) {
                            this.oyuncuKontroller.taklaAt = true;
                        }
                        break;
                    case 'w':
                    case 'W':
                        if (!event.repeat) {
                            this.oyuncu2Kontroller.zipla = true;
                        }

                        break;
                    case 'a':
                    case 'A':
                        this.oyuncu2Kontroller.solKosu = true;
                        this.oyuncu2Kontroller.sonKosulanYonSagdir = false;
                        break;
                    case 's':
                    case 'S':
                        break;
                    case 'd':
                    case 'D':
                        this.oyuncu2Kontroller.sagKosu = true;
                        this.oyuncu2Kontroller.sonKosulanYonSagdir = true;
                        break;
                    case 'Shift':
                        if (!event.repeat) {
                            this.oyuncu2Kontroller.taklaAt = true;
                        }

                        break;
                    case ' ':
                        if (!event.repeat) {
                            this.oyuncu2Kontroller.saldiri = true;
                        }

                        break;
                }

            });
            window.addEventListener('keyup', (event) => {
                const birinciOyuncuTuslari = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ö', 'Ö'];
                switch (event.key) {
                    case 'ArrowLeft':
                        this.oyuncuKontroller.solKosu = false;
                        this.oyuncuKontroller.sonKosulanYonSagdir = true;
                        break;
                    case 'ArrowRight':
                        this.oyuncuKontroller.sagKosu = false;
                        this.oyuncuKontroller.sonKosulanYonSagdir = false;
                        break;
                    case 'ArrowUp':
                        this.oyuncuKontroller.zipla = false;
                        break;
                    case 'ArrowDown':
                        this.oyuncuKontroller.saldiri = false;
                        break;
                    case 'ö':
                    case 'Ö':
                        this.oyuncuKontroller.taklaAt = false;
                        break;
                    case 'w':
                    case 'W':
                        this.oyuncu2Kontroller.zipla = false;
                        break;
                    case 'a':
                    case 'A':
                        this.oyuncu2Kontroller.solKosu = false;
                        this.oyuncu2Kontroller.sonKosulanYonSagdir = true;
                        break;
                    case 's':
                    case 'S':
                        break;
                    case 'd':
                    case 'D':
                        this.oyuncu2Kontroller.sagKosu = false;
                        this.oyuncu2Kontroller.sonKosulanYonSagdir = false;
                        break;
                    case 'Shift':
                        break;
                    case ' ':
                        break;
                }
                if (birinciOyuncuTuslari.includes(event.key)) {
                    this.socket.emit('oyun bilgisi', this.oyuncuKontroller);
                } else {
                    this.socket.emit('oyun bilgisi', this.oyuncu2Kontroller);

                }
            });
            if (!this.mobildir) {
                (this.$refs["canvas-container"] as HTMLDivElement).addEventListener('mousedown', () => {
                    this.oyuncu2Kontroller.saldiri = true;
                });
            }
            (this.$refs["canvas-container"] as HTMLDivElement).addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });


            // https://stackoverflow.com/questions/4787431/check-fps-in-js
            // The higher this value, the less the fps will reflect temporary variations
            // A value of 1 will only keep the last value
            // 16.7ms yani 60 fps'den baslatiyoruz hesaplamaya.

            const filterStrength = 5;
            let frameTime = 16.7, lastLoop = performance.now(), thisLoop;

            function canlandir() {
                window.requestAnimationFrame(canlandir);
                tuval.fps = 1000 / frameTime;
                tuval.temizle();
                arkaplan.guncelle();
                oyuncu.guncelle();
                oyuncu2.guncelle();
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
    },
    mounted() {
        this.oyuncular = axios.get('/oyuncular').then(response => {
            this.oyuncular = response.data;
        }).catch(error => {
            console.log(error);
        });

        window.addEventListener('resize', this.ekranBoyutuGuncelle);
        window.addEventListener('fullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('mozfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('webkitfullscreenchange', this.tamEkranGuncelle);
        window.addEventListener('msfullscreenchange', this.tamEkranGuncelle);



        this.main();
        this.socket.on('oyun bilgisi', (msg) => {
            console.log(JSON.stringify(msg));
            if (msg.birinciOyuncudur) {
                this.kontrolGuncelle(this.oyuncuKontroller, msg)

            } else {
                this.kontrolGuncelle(this.oyuncu2Kontroller, msg)
            }
        })
    },

    destroyed() {
        window.removeEventListener('resize', this.ekranBoyutuGuncelle);
        window.removeEventListener('fullscreenchange', this.tamEkranGuncelle);
        window.removeEventListener('mozfullscreenchange', this.tamEkranGuncelle);
        window.removeEventListener('webkitfullscreenchange', this.tamEkranGuncelle);
        window.removeEventListener('msfullscreenchange', this.tamEkranGuncelle);

    }
});

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
