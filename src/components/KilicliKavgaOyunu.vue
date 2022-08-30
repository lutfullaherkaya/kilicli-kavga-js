<template>
    <div class="canvas-container">
        <div id="fps" style="position: absolute; top: 1px; left: 1px; color: white; font-size: 0.5rem;"></div>
        <canvas></canvas>
        <div class="can-zaman-arayuzu">
            <div class="can-cubugu can-cubugu-1">
                <div id="ic-can-cubugu-1"></div>
                <span id="can-cubugu-isim-1" class="can-cubugu-isim">oyncu1</span>
            </div>
            <div class="zaman-kutusu">
                <span id="zaman">90</span>
            </div>
            <div class="can-cubugu can-cubugu-2">
                <div id="ic-can-cubugu-2"></div>
                <span id="can-cubugu-isim-2" class="can-cubugu-isim">oyncu2</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Sprite, Savasci, SavasciKontrolleri, Tuval, SavasciCarpisma} from '@/js/oyn.ts';

export default Vue.extend({
    name: 'KilicliKavgaOyunu',
    data() {
        return {
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
    methods: {
        main() {

            const tuval = new Tuval(document.querySelector('canvas')!, 800, 600, 480);

            setInterval(() => {
                tuval.setZamanKutucugu();
            }, 1000)
            const arkaplan = new Sprite(tuval, {
                pozisyon: {
                    x: 0,
                    y: 0,
                },
                resimKaynagi: './sprites/NightForest/Image without mist.png',
                skala: 1.67,
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

            window.addEventListener('keydown', (event) => {
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
                        this.oyuncuKontroller.zipla = true;
                        break;
                    case 'ArrowDown':
                        this.oyuncuKontroller.saldiri = true;
                        break;
                    case 'ö':
                    case 'Ö':
                        this.oyuncuKontroller.taklaAt = true;
                        break;
                    case 'w':
                    case 'W':
                        this.oyuncu2Kontroller.zipla = true;
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
                        this.oyuncu2Kontroller.taklaAt = true;
                        break;
                    case ' ':
                        this.oyuncu2Kontroller.saldiri = true;
                        break;
                }
                if (birinciOyuncuTuslari.includes(event.key)) {
                    this.$socket.emit('oyun bilgisi', this.oyuncuKontroller);
                } else {
                    this.$socket.emit('oyun bilgisi', this.oyuncu2Kontroller);

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
                        this.oyuncu2Kontroller.taklaAt = false;
                        break;
                    case ' ':
                        this.oyuncu2Kontroller.saldiri = false;
                        break;
                }
                if (birinciOyuncuTuslari.includes(event.key)) {
                    this.$socket.emit('oyun bilgisi', this.oyuncuKontroller);
                } else {
                    this.$socket.emit('oyun bilgisi', this.oyuncu2Kontroller);

                }
            });
            window.addEventListener('mousedown', () => {
                this.oyuncu2Kontroller.saldiri = true;
            })
            window.addEventListener('mouseup', () => {
                this.oyuncu2Kontroller.saldiri = false;
            })
            window.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            })

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
        this.main();
        this.$socket.on('oyun bilgisi', (msg) => {
            console.log(JSON.stringify(msg));
            if (msg.birinciOyuncudur) {
                Object.assign(this.oyuncuKontroller, msg)

            } else {
                Object.assign(this.oyuncu2Kontroller, msg)
            }
        })
    }
})
;
</script>

<style scoped lang="scss">
* {
    --zaman-genisligi: 10%;
    --can-cubugu-yuksekligi: 15px;
    --can-cubugu-kenar-kalinligi: 2px;
}

canvas, img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

.canvas-container {
    position: relative;
}

.can-zaman-arayuzu {

    position: absolute;
    top: 1%;
    left: 1%;
    right: 1%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #e8e8e8;
}

.can-cubugu {
    background-color: black;
    height: 100%;
    width: 100%;
    padding: var(--can-cubugu-kenar-kalinligi);

}

.can-cubugu-1 {
    padding-right: 0;
}

.can-cubugu-2 {
    padding-left: 0;
}

#ic-can-cubugu-1, #ic-can-cubugu-2 {
    width: 100%;
    height: var(--can-cubugu-yuksekligi);
    background-color: rgba(255, 84, 84, 0.82);
    transition: width 0.2s ease-in-out;
}

#ic-can-cubugu-1 {

}

#ic-can-cubugu-2 {
    float: right;
}

.zaman-kutusu {
    padding: 5px;
    border-top: black solid var(--can-cubugu-kenar-kalinligi);
    border: black solid var(--can-cubugu-kenar-kalinligi);
    background-color: slategray;
    text-align: center;
}

.can-cubugu-isim {
    position: absolute;
    top: 50%;

    transform: translate(0, -50%);
}

#can-cubugu-isim-1 {
    left: calc(var(--can-cubugu-kenar-kalinligi) * 2);
}

#can-cubugu-isim-2 {
    right: calc(var(--can-cubugu-kenar-kalinligi) * 2);
}
</style>
